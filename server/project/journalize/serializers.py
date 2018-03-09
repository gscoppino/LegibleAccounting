from rest_framework import serializers
from .models import JournalEntry, Transaction, Receipt
from accounts.serializers import RetrieveAccountSerializer
from project.serializers import UserSerializer

from drf_extra_fields.fields import Base64FileField

import magic

class ReceiptFileField(Base64FileField):
    ALLOWED_TYPES = ['xlsx', 'xls', 'docx', 'doc', 'pdf']

    def get_file_extension(self, filename, decoded_file):
        file_type = magic.from_buffer(decoded_file)

        if file_type == 'Microsoft Excel 2007+':
            return 'xlsx'
        elif file_type == 'Microsoft Word 2007+':
            return 'docx'
        elif 'Microsoft Excel' in file_type:
            return 'xls'
        elif 'Microsoft Word' in file_type:
            return 'doc'
        elif 'PDF document' in file_type:
            return 'pdf'
        else:
            return None

class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = ('file', 'original_filename')

    file = ReceiptFileField()


class RetrieveTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('date', 'affected_account', 'journal_entry', 'value', 'is_debit', 'receipts',)

    affected_account = RetrieveAccountSerializer()
    receipts = ReceiptSerializer(many=True)


class CreateTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ('affected_account', 'value', 'is_debit', 'receipts',)

    receipts = ReceiptSerializer(many=True)

    def validate_value(self, value):
        if value <= 0:
            raise serializers.ValidationError('A transaction cannot have a negative value.')

        return value


class RetrieveJournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ('date_created', 'date', 'entry_type', 'is_approved', 'rejection_memo', 'description', 'creator', 'transactions',)

    transactions = RetrieveTransactionSerializer(many=True)
    creator = UserSerializer()
    entry_type = serializers.SerializerMethodField()

    def get_entry_type(self, obj):
        return obj.get_entry_type_display()


class CreateJournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ('date', 'entry_type', 'description', 'transactions',)

    transactions = CreateTransactionSerializer(many=True)

    def validate_transactions(self, value):
        if len(value) == 0:
            raise serializers.ValidationError('There must be at least one transaction in a journal entry.')

        transaction_sum = reduce(lambda accumulated, update:
            accumulated + update['value'] if update['is_debit'] == True else accumulated - update['value'], value, 0)

        if transaction_sum != 0:
            raise serializers.ValidationError('Transactions must be balanced.')

        return value

    def create(self, validated_data):
        transactions = validated_data.pop('transactions')

        journal_entry = JournalEntry.objects.create(**validated_data)

        for transaction in transactions:
            receipts = transaction.pop('receipts')
            transaction = Transaction.objects.create(journal_entry=journal_entry, **transaction)

            for receipt in receipts:
                Receipt.objects.create(of_transaction=transaction, **receipt)

        return journal_entry


class UpdateJournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ('is_approved', 'rejection_memo',)

    def update(self, instance, validated_data):
        if instance.is_approved is not None:
            raise serializers.ValidationError('The journal entry has already been approved/denied and can not be changed!')

        if (validated_data.get('is_approved') == False and len(validated_data.get('rejection_memo')) == 0):
            raise serializers.ValidationError('A rejection reason must be provided for denying the journal entry.')

        instance.is_approved = validated_data.get('is_approved')
        instance.rejection_memo = validated_data.get('rejection_memo')
        instance.save()

        return instance

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from rest_framework.permissions import DjangoModelPermissions

from .models import Account, AccountType
from .serializers import AccountSerializer, AccountTypeSerializer, RetrieveAccountSerializer, RetrieveAccountTypeSerializer

from django.http.response import HttpResponse

class AccountTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AccountType.objects.all()
    serializer_class = AccountTypeSerializer

    def get_serializer_class(self):
        if self.request.method != 'GET':
            return super(AccountTypeViewSet, self).get_serializer_class()

        return RetrieveAccountTypeSerializer


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    filter_backends = (SearchFilter, DjangoFilterBackend,)
    search_fields = ('name', 'description', 'account_type__name',)
    filter_fields = {
        'name': ['contains'],
        'description': ['contains'],
        'account_type__category': ['exact'],
        'account_type__name': ['contains'],
        'is_active': ['exact']
    }
    serializer_class = AccountSerializer
    permission_classes = (DjangoModelPermissions,)


    def update(self, request, pk=None):
        # If the user is not trying to change the active state of the account
        # or if the account balance is 0 or if the user is trying to activate the account
        is_active = request.POST.get("is_active") is not None and request.POST.get("is_active") != 'false'
        print(Account.objects.get(pk=pk).get_balance())
        if Account.objects.get(pk=pk).get_balance() == 0 or is_active == Account.objects.get(pk=pk).is_active or is_active:
            return super(AccountViewSet, self).update(request, pk)
        else:
            return HttpResponse('Active accounts with a none-zero balance cannot be disabled', status=401)

    def get_serializer_class(self):
        if self.request.method != 'GET':
            return super(AccountViewSet, self).get_serializer_class()

        return RetrieveAccountSerializer



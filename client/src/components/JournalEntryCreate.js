import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import DateTime from 'react-datetime';
import moment from 'moment';
import './JournalEntryCreate.css';

class JournalEntryCreate extends Component {
    constructor(props) {
        super(props);

        this.lastKey = null; // Used to uniquely identify transactions for React

        this.filePicker = null;

        this.state = {
            isLoading: false,
            entry_type: '',
            date: moment().format('YYYY-MM-DD'),
            description: '',
            transactions: [
                {
                    key: this.keygen(),
                    accountID: "",
                    amount: 0,
                    is_debit: true,
                    initial_display: true
                },
                {
                    key: this.keygen(),
                    accountID: "",
                    amount: 0,
                    is_debit: false,
                    initial_display: true
                }
            ],
        };

        this.isCalendarOpen = false;

        if (!this.props.accounts || !this.props.entryTypeOptions) {
            this.state.isLoading = true;
        }

        this.addNewTransaction = this.addNewTransaction.bind(this);
        this.toggleCalendar = this.toggleCalendar.bind(this);
        this.renderDatePickerField = this.renderDatePickerField.bind(this);
        this.changeDate = this.changeDate.bind(this);
        this.setCalendarClosed = this.setCalendarClosed.bind(this);
        this.changeEntryType = this.changeEntryType.bind(this);
        this.changeDescription = this.changeDescription.bind(this);
        this.delegateJournalEntrySubmission = this.delegateJournalEntrySubmission.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let entryTypeOptionsLoaded = Array.isArray(this.props.entryTypeOptions) || Array.isArray(nextProps.entryTypeOptions);
        let accountsLoaded = Array.isArray(this.props.accounts) || Array.isArray(nextProps.accounts);

        if (entryTypeOptionsLoaded && accountsLoaded && this.state.isLoading === true) {
            this.setState({
                isLoading: false
            });
        }
    }

    render() {
        if (this.state.isLoading) {
            return (<div>Loading...</div>);
        }

        return (
            <div className="journalEntryCreate">
                <div className="row heading-row">
                    <label className="hidden-xs col-sm-4">New Journal Entry</label>
                    <label className="hidden-xs col-sm-4">Accounts</label>
                    <label className="hidden-xs col-sm-2">Debit</label>
                    <label className="hidden-xs col-sm-2">Credit</label>
                </div>
                <hr />
                <div className="row row-auto-resize topOfEntryWrapper">
                    <div className="col-xs-12 col-sm-4">
                        <DateTime renderInput={this.renderDatePickerField} timeFormat={false} dateFormat="YYYY-MM-DD" value={this.state.date} onChange={this.changeDate} onBlur={this.setCalendarClosed}/>
                        <select className="form-control typeSelect"
                          value={this.state.entry_type}
                          onChange={this.changeEntryType}>
                            <option hidden>Select Type</option>
                            {
                                this.props.entryTypeOptions.map((type, index) => (
                                    <option key={type.value} value={type.value}>{ type.display_name }</option>
                                ))
                            }
                        </select>
                        <div className="descriptionWrapper">
                            <textarea type="text" className="form-control description" cols="1" rows="1" placeholder="Description" value={this.state.description} onChange={this.changeDescription}/>
                        </div>
                        <div className="pad-file-input fileInput">
                            <input type="file" multiple ref={ input => this.filePicker = input } />
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-8">
                        {
                            this.state.transactions.map((item, index) => (
                                <div className="row row-auto-resize new-transaction-wrapper" key={item.key}>
                                    <div className="col-xs-12 col-sm-6">
                                        <div className="flex-row flex-v-center">
                                            <select
                                              className={ 'form-control accountEntryDropdown ' + (item.is_debit ? '' : 'creditAccountEntryDropdown') }
                                              id={index}
                                              value={item.accountID}
                                              onChange={(event) => this.accountNameOnChange(event, index)}>
                                                <option hidden>Select Account</option>
                                                {
                                                    this.props.accounts.map((account, index) => (
                                                        <option key={account.id} value={account.id}>{ account.name }</option>
                                                    ))
                                                }
                                            </select>
                                            <button className="textButton" style={{ marginRight: '5px' }} value={item.is_debit === true } onClick={this.addNewTransaction}>+</button>
                                         	<button className="textButton" value={item.is_debit === true } onClick={(event) => this.removeTransaction(index)}>-</button>
                                        </div>
                                    </div>
                                    <div className={ 'col-xs-12 ' + (item.is_debit ? 'col-sm-6' : 'col-sm-3 col-sm-offset-3') }>
                                        <div className="entryAmountWrapper">
                                            <label className="dollarSign" style={{visibility: !item.initial_display && 'hidden'}}>$</label>
                                            <input type="number" className="form-control entryAmount" placeholder="0.00"
                                              value={item.amount}
                                              onChange={(event) => this.accountAmountOnChange(event, index)}/>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                      </div>
                </div>
                <div className="row row-auto-resize">
                    <div className="col-md-12">
                        <div className="flex-row" style={{visibility: this.journalIsBalanced() && 'hidden'}}>
                            <div className="flex-fill"></div>
                            <label className="debitCreditNotEqualWarning">Debits and Credits are NOT balanced</label>
                        </div>
                        <div className="actionButtonsWrapper flex-row">
                            <div className="flex-fill"></div>
                            <button className="btn btn-success" onClick={this.props.onCancel}>Cancel</button>
                            <button className="btn btn-primary" disabled={!this.journalIsBalanced()} onClick={this.delegateJournalEntrySubmission}>Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    toggleCalendar(openCalendarFn, closeCalendarFn) {
        if (this.isCalendarOpen) {
            closeCalendarFn();
            this.isCalendarOpen = false;
        } else {
            openCalendarFn();
            this.isCalendarOpen = true;
        }
    }

    renderDatePickerField(props, openCalendarFn, closeCalendarFn) {
        return (
            <div>
                <button className="btn btn-default" onClick={() => this.toggleCalendar(openCalendarFn, closeCalendarFn)}>
                    <Glyphicon glyph="calendar" />
                </button>
                <label className="date-left-margin">{ this.state.date }</label>
            </div>
        );
    }

    setCalendarClosed() {
        this.isCalendarOpen = false;
    }

    addNewTransaction(event) {
        var isDebit = (event.target.value === "true");

        var newTransaction = {
            key: this.keygen(),
            accountID: "",
            amount: "0"
        };

        if (isDebit) {
            //is debit; have to insert after the last debit
            newTransaction.is_debit = true;

            let spliceLocation;
            for (let i = 0; i < this.state.transactions.length; i++) {
                if (this.state.transactions[i].is_debit === false) {
                    spliceLocation = i;
                    break;
                }
            }

            this.state.transactions.splice(spliceLocation, 0, newTransaction);
        } else {
            //is credit; can just push to the end of the list
            newTransaction.is_debit = false;
            this.state.transactions.push(newTransaction);
        }

        this.setState({
            transactions: this.state.transactions
        });
    }

    removeTransaction(index) {
        let relatedCount = this.state.transactions
            .filter(transaction => this.state.transactions[index].is_debit ? transaction.is_debit : !transaction.is_debit)
            .length;

        if (relatedCount === 1) {
            this.setState({
                transactions: Object.assign([...this.state.transactions], {
                    [index]: Object.assign({}, this.state.transactions[index], {
                        accountID: "",
                        amount: "0"
                    })
                })
            });
        } else if (relatedCount > 1) {
            this.setState({
                transactions: [
                    ...this.state.transactions.slice(0, index),
                    ...this.state.transactions.slice(index + 1, this.state.transactions.length)
                ]
            });
        }
    }

    accountNameOnChange(event, transactionIndex) {
        var transactionToEdit = this.state.transactions[transactionIndex];

        //edit transaction
        transactionToEdit.accountID = event.target.value;

        this.setState({
            transactions: this.state.transactions
        });
    }

    accountAmountOnChange(event, transactionIndex) {
        var transactionToEdit = this.state.transactions[transactionIndex];

        //edit transaction
        transactionToEdit.amount = event.target.value;

        this.setState({
            transactions: this.state.transactions
        });
    }

    changeDescription(event) {
        this.setState({
            description: event.target.value
        });
    }

    changeDate(momentValue) {
        this.setState({
            date: momentValue.format('YYYY-MM-DD')
        });
    }

    changeEntryType(event) {
        this.setState({
            entry_type: event.target.value
        });
    }

    keygen() {
        if (this.lastKey === null) {
            this.lastKey = 0;
            return this.lastKey;
        }

        return ++this.lastKey;
    }

    loadFile(file) {
        return new Promise(function(resolve, reject) {
            let reader = new FileReader();

            reader.onload = () => resolve({ file: reader.result, original_filename: file.name });
            reader.onerror = reject;

            reader.readAsDataURL(file);
        });
    }

    delegateJournalEntrySubmission() {
        let awaitingFiles = [];
        for (let i = 0; i < this.filePicker.files.length; i++) {
            awaitingFiles.push(this.loadFile(this.filePicker.files[i]));
        }

        Promise.all(awaitingFiles)
            .then((files) => {
                let transactions = this.state.transactions.map(transaction => ({
                    affected_account: transaction.accountID,
                    value: Number(transaction.amount),
                    is_debit: transaction.is_debit
                }));

                this.props.onSubmit({
                    entry_type: this.state.entry_type,
                    date: this.state.date,
                    description: this.state.description,
                    transactions,
                    receipts: files
                });
            });

    }

    journalIsBalanced() {
        let balance = this.state.transactions
            .reduce((result, transaction) => {
                result += (transaction.is_debit ? Number(transaction.amount) : Number(transaction.amount * -1));
                return result;
            }, 0);

        return (balance === 0);
    }
}

export default JournalEntryCreate;

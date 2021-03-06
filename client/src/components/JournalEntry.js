import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { Popover } from 'react-bootstrap';
import { OverlayTrigger } from 'react-bootstrap';
import Auth from '../api/Auth.js';
import './JournalEntry.css';

class JournalEntry extends Component {
    constructor(props) {
        super(props);

        this.state = {
            managementMode: 0, // 1 = 'Approve' | 2 = 'Reject'
            memo: ''
        };

        this.beginEntryApproval = this.beginEntryApproval.bind(this);
        this.beginEntryRejection = this.beginEntryRejection.bind(this);
        this.changeMemo = this.changeMemo.bind(this);
        this.endEntryManagement = this.endEntryManagement.bind(this);
        this.delegateJournalEntryManagement = this.delegateJournalEntryManagement.bind(this);
    }

    render() {
        return (
            <div className="journalEntry">
                <div className="row row-auto-resize">
                    <div className="col-xs-12 col-sm-2">
                        <div> {this.props.entry.date} </div>
                        <div className="journalInfoWrapper">
                            <OverlayTrigger
                                  trigger="click"
                                  rootClose
                                  placement="bottom"
                                  overlay={(
                                      <Popover id="popover-trigger-click-root-close" title="Entry Status">
                                      <div className="statusReason">       
                                            {
                                                this.props.entry.is_approved === null ? (
                                                    <div>Needs Approval</div>
                                                ) : (

                                                    this.props.entry.is_approved ? (
                                                        <div>Approved: {this.props.entry.memo}</div>
                                                    ) : (
                                                        <div>Rejected: {this.props.entry.memo}</div>
                                                    )
                                                )
                                            } 
                                        </div>
                                      </Popover>
                                  )}> 

                                    {
                                        this.props.entry.is_approved === null ? (
                                            <div
                                                className="circle pendingCircle">
                                            </div>

                                        ) : (

                                            this.props.entry.is_approved ? (
                                                <div
                                                    className="circle approvedCircle">
                                                </div>  
                                            ) : (
                                                <div
                                                    className="circle rejectedCircle">
                                                </div> 
                                            )
                                        )
                                    } 
                                    
                            </OverlayTrigger>
                            <OverlayTrigger
                                  trigger="click"
                                  rootClose
                                  placement="bottom"
                                  overlay={(
                                      <Popover id="popover-trigger-click-root-close" title="Attachments">
                                        {
                                            this.props.entry.receipts.map((item, index) => (
                                                <div key={item.file} className="attachment-name-overflow">
                                                    <a href={item.file}>{item.original_filename}</a>
                                                </div>
                                            ))
                                        }
                                      </Popover>
                                  )}>  
                                    <span
                                        className="glyphicon glyphicon-paperclip"
                                        style={{display: !this.props.entry.receipts.length && 'none'}}>
                                    </span>  
                            </OverlayTrigger>
                        </div>
                    </div>
                    <div className="col-xs-12 col-sm-1">
                        <div className="typeEntry">{this.props.entry.entry_type}</div>
                    </div>
                    <div className="col-xs-12 col-sm-1">
                        <div className="typeEntry">{this.props.entry.creator.username}</div>
                    </div>
                    <div className="col-xs-12 col-sm-8 largeWrapper">
                        {
                            this.props.entry.transactions.map((item, index) => (
                                <div className="row row-auto-resize transactionWrapper" key={item.affected_account.id}>
                                    <div className="col-xs-12 col-sm-6">
                                        <div className={"accountNameWrapper " + (item.is_debit ? '' : 'creditAccountEntry')}>
                                            <div className="accountName">
                                               <NavLink to={'/accounts/'+item.affected_account.id + '/ledger'}>{item.affected_account.account_number}</NavLink> - {item.affected_account.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={ 'amountEntry col-xs-12 ' +
                                      (item.is_debit ? 'col-sm-6' : 'col-sm-3 col-sm-offset-3')}>
                                        <label style={{visibility: item.typeIndex !== 0 && 'hidden'}}>$</label>
                                        <div className="amountEntryValue">{item.value}</div>
                                    </div>
                                </div>
                            ))
                        }
                      </div>
                </div>
                
                <div className="row row-auto-resize">
                    <div className="col-md-offset-4 col-md-4 descriptionWrapperWrapper">
                        <div>
                            <strong>Description: </strong>{this.props.entry.description}
                        </div>
                    </div>
                    {
                        this.state.managementMode === 0 ? (                        
                        <div className="col-md-4 actionButtonsWrapper flex-row">
                            <div className="flex-fill"></div>
                            <button className="btn btn-success"
                              style={{ display: (!(Auth.currentUserIsManager()) || !(this.props.entry.is_approved === null)) && 'none' }}
                              onClick={this.beginEntryRejection}>Reject</button>
                            <button
                              style={{ display: (!(Auth.currentUserIsManager()) || !(this.props.entry.is_approved === null)) && 'none' }}
                              className="btn btn-primary" onClick={this.beginEntryApproval}>Approve</button>
                        </div>
                        ) : (<div className="col-md-4"></div>)
                    }
                </div>
                {
                    this.state.managementMode !== 0 ? (
                        <div className="flex-row memoForm">
                            <input type="text" className="form-control" placeholder="Reason" style={{width: '400px' }} value={this.state.memo} onChange={this.changeMemo} />
                            <div className="flex-fill"></div>
                            <button className="btn btn-success" onClick={this.endEntryManagement}>Cancel</button>
                            <button className="btn btn-primary"  onClick={this.delegateJournalEntryManagement}>Submit</button>
                        </div>
                    ) : (
                        <div></div>
                    )
                }
            </div>
        );
    }

    delegateJournalEntryManagement() {
        if (this.state.managementMode === 1) {
            this.props.onApprove(this.props.entry.id, this.state.memo);
        } else if (this.state.managementMode === 2) {
            this.props.onReject(this.props.entry.id, this.state.memo);
        } else {
            return;
        }

        this.setState({
            managementMode: 0
        });
    }

    changeMemo(event) {
        this.setState({
            memo: event.target.value
        });
    }

    beginEntryApproval() {
        this.setState({
            managementMode: 1
        });
    }

    beginEntryRejection() {
        this.setState({
            managementMode: 2
        });
    }

    endEntryManagement() {
        this.setState({
            managementMode: 0
        });
    }
}

export default JournalEntry;

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Auth from '../api/Auth.js';
import './TrialBalance.css';
import TrialBalanceAPI from '../api/TrialBalance.js';

class TrialBalance extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            data: []
        };

        TrialBalanceAPI.getTrialBalance()
            .then(data => {
                this.setState({
                    isLoading: false,
                    data: data,
                });
            });
    }

    render() {
        if (this.state.isLoading) {
            return (<div>Loading...</div>);
        }

        return (
            <div className="trialBalance">
                <div className="titleBar">
                    <h1>Trial Balance</h1>
                </div>

                <div className="tableWrapper .table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                            <th className="accountName">Account Name</th>
                            <th className="debit">Debit</th>
                            <th className="credit">Credit</th> 
                        </tr>
                      </thead>
                      <tbody>
                        { this.state.data.accounts.length ? (
                          this.state.data.accounts.map((item, index) => (
                            <tr>
                                <td>{item.account_name}</td>
                                <td className="debit">{item.is_debit && item.balance}</td>
                                <td className="credit">{!item.is_debit && item.balance}</td>
                            </tr>
                        ))): (
                            <tr>
                                <td>{ this.state.isLoading ? 'Loading...' : 'No Accounts' }</td>
                                <td></td>
                                <td></td>
                            </tr>
                        )}
                            <tr>
                                <td><label>Total</label></td>
                                <td><label className="doubleUnderline">{this.state.data.debit_total}</label></td>
                                <td><label className="doubleUnderline">{this.state.data.credit_total}</label></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}

export default TrialBalance;
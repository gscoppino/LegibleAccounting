import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import './TrialBalance.css';
import AccountsAPI from '../api/AccountsApi.js';
import Spinner from './Spinner.js';

class TrialBalance extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            data: []
        };

        AccountsAPI.getTrialBalance()
            .then(data => {
                this.setState({
                    isLoading: false,
                    data: data,
                });
            });
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div style={{ marginTop: '2rem' }} className="full-height flex-row flex-v-center flex-h-center">
                    <Spinner />
                </div>
            );
        }

        return (
            <div className="trial-balance">

                <div className="text-center title-heading">
                    <div className="business-name">Addams & Family Inc.</div>
                    <div className="income-statement-main-heading">Trial Balance</div>
                    <div className="as-of-date ">As of {moment(this.state.data.as_of_date).format('MMMM Do YYYY')}</div>
                </div>

                <div className="tableWrapper">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                            <th>Account</th>
                            <th className="debitCol text-right">Debit</th>
                            <th className="creditCol text-right">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        { this.state.data.accounts.length ? (
                          this.state.data.accounts.map((item, index) => (
                            <tr key={item.account_id}>
                                <td>
                                    <NavLink to={`/accounts/${item.account_id}/ledger`}>
                                        {item.account_number}
                                    </NavLink>
                                    <span> - {item.account_name}</span>
                                </td>
                                <td className="debit" align="right">{item.is_debit && item.balance}</td>
                                <td className="credit" align="right">{!item.is_debit && item.balance}</td>
                            </tr>
                        ))): (
                            <tr>
                                <td>{ this.state.isLoading ? 'Loading...' : 'No Data' }</td>
                                <td></td>
                                <td></td>
                            </tr>
                        )}
                            <tr>
                                <td><label>Total</label></td>
                                <td align="right"><label className="doubleUnderline">{this.state.data.debit_total}</label></td>
                                <td align="right"><label className="doubleUnderline">{this.state.data.credit_total}</label></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

}

export default TrialBalance;

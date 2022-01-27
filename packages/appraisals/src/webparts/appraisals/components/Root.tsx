import { BrowserRouter, Switch, Route } from 'react-router-dom';
import * as React from 'react';
import { IAppraisalsWebPartProps } from '../AppraisalsWebPart';
import constants from '../utils/constants';
import AppraisalPeriods from './periods/AppraisalPeriods';

const Root = (props: IAppraisalsWebPartProps) => {
    return (
        <BrowserRouter>
            <Switch>
                <Route
                    render={({ location }) => {
                        const searchParams = new URLSearchParams(
                            location.search
                        );
                        if (!searchParams.get(constants.periodId)) {
                            return <AppraisalPeriods />;
                        } else {
                            return (
                                <div>
                                    <div>
                                        <h1>Welcome to Appraisals</h1>
                                        <div>{props.description}</div>
                                    </div>
                                </div>
                            );
                        }
                    }}
                />
            </Switch>
        </BrowserRouter>
    );
};

export default Root;

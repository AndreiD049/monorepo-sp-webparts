import { groupBy } from '@microsoft/sp-lodash-subset';
import * as React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Bar,
} from 'recharts';
import FeedbackWebPart from '../../FeedbackWebPart';
import { IFeedback, StatusType, STATUS_TYPES } from '../../models/IFeedback';

const STATUS_COLORS = {
    New: () => FeedbackWebPart.theme.palette.greenLight,
    Review: () => FeedbackWebPart.theme.palette.blueLight,
    Approved: () => FeedbackWebPart.theme.palette.orangeLight,
    Rejected: () => FeedbackWebPart.theme.palette.red,
    Implemented: () => FeedbackWebPart.theme.palette.purple,
    Closed: () => FeedbackWebPart.theme.palette.redDark,
};

export const HomeBarChart: React.FC<{ feedbacks: IFeedback[] }> = (props) => {
    const data = React.useMemo(() => {
        const grouppedApp = groupBy(props.feedbacks, 'Application');
        const grouppedAppStatus = Object.keys(grouppedApp).map((key) => {
            const grouppedAppStatus = groupBy(grouppedApp[key], 'Status');
            const result: Partial<{ [Property in StatusType]: number }> & {
                Application: string;
            } = {
                Application: key,
            };
            Object.keys(grouppedAppStatus).forEach((status: StatusType) => {
                result[status] = grouppedAppStatus[status].length;
            });
            return result;
        });
        return grouppedAppStatus;
    }, [props.feedbacks]);

	if (props.feedbacks.length === 0) {
		return null;
	}

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Application" />
                <YAxis />
                <Tooltip />
                <Legend />
                {STATUS_TYPES.map((status) => (
                    <Bar
						key={status}
                        dataKey={status}
                        stackId="a"
                        fill={STATUS_COLORS[status]()}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    );
};

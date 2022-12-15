import { ITextFieldProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { MainService } from '../../services/main-service';
import { GenericTextField } from '../GenericTextField';

export interface ISystemTextFieldProps extends ITextFieldProps {
    options?: string[];
}

export const SystemTextField: React.FC<ISystemTextFieldProps> = ({ options = [], ...props  }) => {
    const { ProcessService } = MainService;
    return <GenericTextField listId="systemFieldChoices" {...props} options={options} getOptions={async () => ProcessService.getSystemChoices()} />
};

export const CategoryTextField: React.FC<ISystemTextFieldProps> = ({ options = [], ...props  }) => {
    const { ProcessService } = MainService;
    return <GenericTextField listId="categoryFieldChoices" {...props} options={options} getOptions={async () => ProcessService.getCategoryOptions()} />
};

export const UomTextField: React.FC<ISystemTextFieldProps> = ({ options = [], ...props  }) => {
    return <GenericTextField listId="uomFieldChoices" {...props} options={options} getOptions={async () => ['Order', 'Day', 'Week', 'Month']} />
};

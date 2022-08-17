import { MessageBarType } from 'office-ui-fabric-react';
import { SPnotify } from 'sp-react-notifications';
import { IFieldAddResult, IList } from "sp-preset";

export default async function ensureFields(list: IList) {
    const trainingDateField = await list.fields.createFieldAsXml(
        `<Field Indexed='FALSE' Description='' DisplayName='TrainingDate' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='TrainingDate' Required='FALSE' Title='TrainingDate' Type='DateTime'></Field>`
    )
    notifyOnFieldCreation(trainingDateField)
    const trainingTitleField = await list.fields.createFieldAsXml(
        `<Field Indexed='TRUE' Description='Date of the training' DisplayName='TrainingTitle' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='TrainingTitle' Required='TRUE' Title='TrainingTitle' Type='DateTime'></Field>`
    )
    notifyOnFieldCreation(trainingTitleField)
    const modelField = await list.fields.createFieldAsXml(
        `<Field Indexed='TRUE' CommaSeparator='TRUE' CustomUnitOnRight='TRUE' Decimals='0' Description='Training model' DisplayName='Model' Format='Dropdown' IsModern='TRUE' Name='Model' Percentage='FALSE' Required='TRUE' Title='{ h.inflection.classify(name) }' Type='Number' Unit='None'></Field>`
    )
    notifyOnFieldCreation(modelField)
    /** Set title not required */
    const titleField = list.fields.getByTitle('Title');
    await titleField.update({
        Required: false,
    });

    /**
    * Adjust default view
    */
    const view = await list.defaultView();
    await list.defaultView.setViewXml(
        `<View 
            Name=\"${view.Id}\" 
            DefaultView=\"TRUE\" 
            MobileView=\"TRUE\" 
            MobileDefaultView=\"TRUE\" 
            Type=\"HTML\" 
            DisplayName=\"All Items\" 
            Url=\"${view.ServerRelativeUrl}\" 
            Level=\"1\" 
            BaseViewID=\"1\" 
            ContentTypeID=\"0x\" 
            ImageUrl=\"${view.ImageUrl}\">
                <Query>
                    <OrderBy>
                        <FieldRef Name=\"ID\"/>
                    </OrderBy>
                </Query>
                <ViewFields>
                    <FieldRef Name=\"LinkTitle\"/>
                    <FieldRef Name=\"${modelField.data.InternalName}\"/>
                    <FieldRef Name=\"${trainingTitleField.data.InternalName}\"/>
                    <FieldRef Name=\"${trainingDateField.data.InternalName}\"/>
                    <FieldRef Name=\"Author\"/>
                    <FieldRef Name=\"Created\"/>
                </ViewFields>
                <RowLimit Paged=\"TRUE\">30</RowLimit>
                <JSLink>clienttemplates.js</JSLink>
                <XslLink Default=\"TRUE\">main.xsl</XslLink>
                <Toolbar Type=\"Standard\"/>
                <ViewType2>COMPACTLIST</ViewType2>
        </View>`
    );
}

function notifyOnFieldCreation(field: IFieldAddResult) {
    SPnotify({
        message: `Field '${field.data.Title}' added successfully`,
        messageType: MessageBarType.success,
    });
}
import { MessageBarType } from 'office-ui-fabric-react';
import { SPnotify } from 'sp-react-notifications';
import { IFieldAddResult, IList } from "sp-preset";

export default async function ensureFields(list: IList) {
    const sessionDateField = await list.fields.createFieldAsXml(
        `<Field Indexed='TRUE' Description='' DisplayName='SessionDate' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='SessionDate' Required='TRUE' Title='SessionDate' Type='DateTime'></Field>`
    )
    notifyOnFieldCreation(sessionDateField)
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
                    <FieldRef Name=\"${sessionDateField.data.InternalName}\"/>
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
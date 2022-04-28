import { Guid } from '@microsoft/sp-core-library';
import { MessageBarType } from 'office-ui-fabric-react';
import { List, SPFI } from 'sp-preset';
import {
    IFieldAddResult,
} from 'sp-preset/node_modules/@pnp/sp/fields';
import { SPnotify } from 'sp-react-notifications';
import { ICipWebPartProps } from '../CipWebPart';

export default async function setupLists(sp: SPFI, props: ICipWebPartProps) {
    SPnotify({
        message: 'Please wait. Creating lists',
        messageType: MessageBarType.warning,
    });

    const taskList = await sp.web.lists.ensure(props.tasksListName);

    if (taskList.created) {
        const list = sp.web.lists.getByTitle(props.tasksListName);
        
        const description = await list.fields.createFieldAsXml(
            `<Field AppendOnly='FALSE' Description='Task description' DisplayName='Description' Format='Dropdown' IsModern='TRUE' IsolateStyles='FALSE' Name='Description' RichText='FALSE' RichTextMode='Compatible' Title='Description' Type='Note'></Field>`
        );
        notifyOnFieldCreation(description);

        const category = await list.fields.createFieldAsXml(
            `<Field CustomFormatter='{&quot;elmType&quot;:&quot;div&quot;,&quot;style&quot;:{&quot;flex-wrap&quot;:&quot;wrap&quot;,&quot;display&quot;:&quot;flex&quot;},&quot;children&quot;:[{&quot;elmType&quot;:&quot;div&quot;,&quot;style&quot;:{&quot;box-sizing&quot;:&quot;border-box&quot;,&quot;padding&quot;:&quot;4px 8px 5px 8px&quot;,&quot;overflow&quot;:&quot;hidden&quot;,&quot;text-overflow&quot;:&quot;ellipsis&quot;,&quot;display&quot;:&quot;flex&quot;,&quot;border-radius&quot;:&quot;16px&quot;,&quot;height&quot;:&quot;24px&quot;,&quot;align-items&quot;:&quot;center&quot;,&quot;white-space&quot;:&quot;nowrap&quot;,&quot;margin&quot;:&quot;4px 4px 4px 4px&quot;},&quot;attributes&quot;:{&quot;class&quot;:{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;NA&quot;]},&quot;sp-field-fontSizeSmall&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;&quot;]},&quot;&quot;,&quot;sp-field-borderAllRegular sp-field-borderAllSolid sp-css-borderColor-neutralSecondary&quot;]}]}},&quot;txtContent&quot;:&quot;@currentField&quot;}],&quot;templateId&quot;:&quot;BgColorChoicePill&quot;}' Description='Task&#39;s category' DisplayName='Category' FillInChoice='TRUE' Format='Dropdown' IsModern='TRUE' Name='Category' Title='Category' Type='Choice'><CHOICES><CHOICE>NA</CHOICE></CHOICES></Field>`
        );
        notifyOnFieldCreation(category);

        const responsible = await list.fields.createFieldAsXml(`<Field Description='User responsible for executing current task' Indexed='TRUE' DisplayName='Responsible' Format='Dropdown' IsModern='TRUE' List='UserInfo' Name='Responsible' Required='TRUE' Title='Responsible' Type='User' UserDisplayOptions='NamePhoto' UserSelectionMode='0' UserSelectionScope='0'></Field>`);
        notifyOnFieldCreation(responsible);

        const team = await list.fields.createFieldAsXml(
            `<Field DisplayName='Team' Format='Dropdown' IsModern='TRUE' MaxLength='50' Name='Team' Required='TRUE' Title='Team' Type='Text'></Field>`
        );
        notifyOnFieldCreation(team);

        const status = await list.fields.createFieldAsXml(
            `<Field Indexed='TRUE' CustomFormatter='{&quot;elmType&quot;:&quot;div&quot;,&quot;style&quot;:{&quot;flex-wrap&quot;:&quot;wrap&quot;,&quot;display&quot;:&quot;flex&quot;},&quot;children&quot;:[{&quot;elmType&quot;:&quot;div&quot;,&quot;style&quot;:{&quot;box-sizing&quot;:&quot;border-box&quot;,&quot;padding&quot;:&quot;4px 8px 5px 8px&quot;,&quot;overflow&quot;:&quot;hidden&quot;,&quot;text-overflow&quot;:&quot;ellipsis&quot;,&quot;display&quot;:&quot;flex&quot;,&quot;border-radius&quot;:&quot;16px&quot;,&quot;height&quot;:&quot;24px&quot;,&quot;align-items&quot;:&quot;center&quot;,&quot;white-space&quot;:&quot;nowrap&quot;,&quot;margin&quot;:&quot;4px 4px 4px 4px&quot;},&quot;attributes&quot;:{&quot;class&quot;:{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;New&quot;]},&quot;sp-css-backgroundColor-BgCornflowerBlue sp-field-fontSizeSmall sp-css-color-CornflowerBlueFont&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;On-hold&quot;]},&quot;sp-css-backgroundColor-BgGold sp-css-borderColor-GoldFont sp-field-fontSizeSmall sp-css-color-GoldFont&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;In-Progress&quot;]},&quot;sp-css-backgroundColor-BgLightBlue sp-css-borderColor-LightBlueFont sp-field-fontSizeSmall sp-css-color-LightBlueFont&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;&quot;]},&quot;&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;Blocked&quot;]},&quot;sp-css-backgroundColor-BgCoral sp-field-fontSizeSmall sp-css-color-CoralFont&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;Cancelled&quot;]},&quot;sp-css-backgroundColor-BgDustRose sp-field-fontSizeSmall sp-css-color-DustRoseFont&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;Finished&quot;]},&quot;sp-css-backgroundColor-BgMintGreen sp-css-borderColor-MintGreenFont sp-field-fontSizeSmall sp-css-color-MintGreenFont&quot;,&quot;sp-field-borderAllRegular sp-field-borderAllSolid sp-css-borderColor-neutralSecondary&quot;]}]}]}]}]}]}]}},&quot;txtContent&quot;:&quot;@currentField&quot;}],&quot;templateId&quot;:&quot;BgColorChoicePill&quot;}' DisplayName='Status' FillInChoice='FALSE' Format='Dropdown' IsModern='TRUE' Name='Status' Required='TRUE' Title='Status' Type='Choice'><CHOICES><CHOICE>New</CHOICE><CHOICE>On-hold</CHOICE><CHOICE>In-Progress</CHOICE><CHOICE>Blocked</CHOICE><CHOICE>Cancelled</CHOICE><CHOICE>Finished</CHOICE></CHOICES><Default>New</Default></Field>`
        );
        notifyOnFieldCreation(status);

        const startDate = await list.fields.createFieldAsXml(
            `<Field DisplayName='Start Date' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='StartDate' Required='FALSE' Title='StartDate' Type='DateTime'></Field>`
        );
        notifyOnFieldCreation(startDate);

        const finishDate = await list.fields.createFieldAsXml(
            `<Field DisplayName='Finish Date' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='FinishDate' Required='FALSE' Title='FinishDate' Type='DateTime'></Field>`
        );
        notifyOnFieldCreation(finishDate);

        const dueDate = await list.fields.createFieldAsXml(
            `<Field DisplayName='Due Date' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='DueDate' Required='TRUE' Title='DueDate' Type='DateTime'></Field>`
        );
        notifyOnFieldCreation(dueDate);

        const progress = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='TRUE' CustomUnitOnRight='TRUE' Description='Progress in percentage (from 0 to 100 %)' DisplayName='Progress' Format='Dropdown' IsModern='TRUE' Max='100' Min='0' Name='Progress' Percentage='TRUE' Required='TRUE' Title='Progress' Type='Number' Unit='Percentage'><Default>0</Default></Field>`
        );
        notifyOnFieldCreation(progress);

        const estimated = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitName='hour(s)' CustomUnitOnRight='TRUE' Decimals='0' Description='Estimated time (in hours) for completion of this task and all of it&#39;s subtasks.' DisplayName='Estimated Time' Format='Dropdown' IsModern='TRUE' Name='EstimatedTime' Percentage='FALSE' Required='TRUE' Title='EstimatedTime' Type='Number' Unit='Custom'></Field>`
        );
        notifyOnFieldCreation(estimated);

        const effective = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitName='hour(s)' CustomUnitOnRight='TRUE' Decimals='0' Description='Actual time (in hours) required to complete this task' DisplayName='Effective Time' Format='Dropdown' IsModern='TRUE' Name='EffectiveTime' Percentage='FALSE' Required='TRUE' Title='EffectiveTime' Type='Number' Unit='Custom'><Default>0</Default></Field>`
        );
        notifyOnFieldCreation(effective);

        const parent = await list.fields.createFieldAsXml(
            `<Field Description='Link to parent task' DisplayName='Parent' Format='Dropdown' Indexed='TRUE' IsModern='TRUE' IsRelationship='TRUE' List='${taskList.data.Id}' Name='Parent' RelationshipDeleteBehavior='Restrict' ShowField='Title' Title='Parent' Type='Lookup'></Field>`
        );
        notifyOnFieldCreation(parent)

        const main = await list.fields.createFieldAsXml(
            `<Field Description='Link to main (top) task' DisplayName='Main Task' Format='Dropdown' Indexed='TRUE' IsModern='TRUE' IsRelationship='TRUE' List='${taskList.data.Id}' Name='MainTask' RelationshipDeleteBehavior='Restrict' ShowField='Title' Title='MainTask' Type='Lookup'></Field>`
        );
        notifyOnFieldCreation(main)

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
                        <FieldRef Name=\"${description.data.InternalName}\"/>
                        <FieldRef Name=\"${responsible.data.InternalName}\"/>
                        <FieldRef Name=\"${team.data.InternalName}\"/>
                        <FieldRef Name=\"${status.data.InternalName}\"/>
                        <FieldRef Name=\"${startDate.data.InternalName}\"/>
                        <FieldRef Name=\"${finishDate.data.InternalName}\"/>
                        <FieldRef Name=\"${dueDate.data.InternalName}\"/>
                        <FieldRef Name=\"${progress.data.InternalName}\"/>
                        <FieldRef Name=\"${estimated.data.InternalName}\"/>
                        <FieldRef Name=\"${effective.data.InternalName}\"/>
                        <FieldRef Name=\"${category.data.InternalName}\"/>
                        <FieldRef Name=\"${parent.data.InternalName}\"/>
                        <FieldRef Name=\"${main.data.InternalName}\"/>
                    </ViewFields>
                    <RowLimit Paged=\"TRUE\">30</RowLimit>
                    <JSLink>clienttemplates.js</JSLink>
                    <XslLink Default=\"TRUE\">main.xsl</XslLink>
                    <Toolbar Type=\"Standard\"/>
                    <ViewType2>COMPACTLIST</ViewType2>
            </View>`
        );
    }

    SPnotify({
        message: 'All lists were created successfully',
        messageType: MessageBarType.success,
    });
}

function notifyOnFieldCreation(field: IFieldAddResult) {
    SPnotify({
        message: `Field '${field.data.Title}' added successfully`,
        messageType: MessageBarType.success,
    });
}

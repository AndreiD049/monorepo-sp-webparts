import { MessageBarType } from 'office-ui-fabric-react';
import { SPFI } from 'sp-preset';
import {
    IFieldAddResult,
} from 'sp-preset/node_modules/@pnp/sp/fields';
import { SPnotify } from 'sp-react-notifications';
import { ICipWebPartProps } from '../CipWebPart';

export default async function setupLists(sp: SPFI, props: ICipWebPartProps) {
    /**
     * Comment list
     */
    const commentList = await sp.web.lists.ensure(props.commentListName);
    console.log(commentList);

    if (commentList.created) {
        /** Set title not required */
        const titleField = commentList.list.fields.getByTitle('Title');
        await titleField.update({
            Hidden: true,
            Required: false,
        });

        /** List id */
        const listId = await commentList.list.fields.createFieldAsXml(
            `<Field Indexed='TRUE'  CommaSeparator='TRUE' CustomUnitOnRight='TRUE' Decimals='0' Description='Id of the list item where comment was left' DisplayName='ListId' Format='Dropdown' IsModern='TRUE' Name='ListId' Percentage='FALSE' Required='TRUE' Title='ListId' Type='Number' Unit='None'></Field>`
        );
        notifyOnFieldCreation(listId);

        /** Item id */
        const itemId = await commentList.list.fields.createFieldAsXml(
            `<Field Indexed='TRUE' CommaSeparator='TRUE' CustomUnitOnRight='TRUE' Decimals='0' Description='Id of the list item where comment was left' DisplayName='ItemId' Format='Dropdown' IsModern='TRUE' Name='ItemId' Percentage='FALSE' Required='TRUE' Title='ItemId' Type='Number' Unit='None'></Field>`
        );
        notifyOnFieldCreation(itemId);

        /** Comment contents */
        const comment = await commentList.list.fields.createFieldAsXml(
            `<Field AppendOnly='FALSE' Description='Comment contents' DisplayName='Comment' Format='Dropdown' IsModern='TRUE' IsolateStyles='FALSE' Name='Comment' Required='TRUE' RichText='FALSE' RichTextMode='Compatible' Title='Comment' Type='Note'></Field>`
        );
        notifyOnFieldCreation(comment);

        /**
         * Adjust default view
         */
        const view = await commentList.list.defaultView();
        await commentList.list.defaultView.setViewXml(
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
                        <FieldRef Name=\"${listId.data.InternalName}\"/>
                        <FieldRef Name=\"${itemId.data.InternalName}\"/>
                        <FieldRef Name=\"${comment.data.InternalName}\"/>
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

        SPnotify({
            message: 'Comment list was created successfully',
            messageType: MessageBarType.success,
        });
    } else {
        SPnotify({
            message: 'Comment list is already created. Skipping...',
            messageType: MessageBarType.info,
        });
    }

    /**
     * Task list
     */
    const taskList = await sp.web.lists.ensure(props.tasksListName);
    
    if (taskList.created) {
        SPnotify({
            message: 'Please wait. Creating lists',
            messageType: MessageBarType.warning,
        });

        const list = sp.web.lists.getByTitle(props.tasksListName);
        
        const description = await list.fields.createFieldAsXml(
            `<Field AppendOnly='FALSE' Description='Task description' DisplayName='Description' Format='Dropdown' IsModern='TRUE' IsolateStyles='FALSE' Name='Description' RichText='FALSE' RichTextMode='Compatible' Title='Description' Type='Note'></Field>`
        );
        notifyOnFieldCreation(description);

        const category = await list.fields.createFieldAsXml(
            `<Field CustomFormatter='{&quot;elmType&quot;:&quot;div&quot;,&quot;style&quot;:{&quot;flex-wrap&quot;:&quot;wrap&quot;,&quot;display&quot;:&quot;flex&quot;},&quot;children&quot;:[{&quot;elmType&quot;:&quot;div&quot;,&quot;style&quot;:{&quot;box-sizing&quot;:&quot;border-box&quot;,&quot;padding&quot;:&quot;4px 8px 5px 8px&quot;,&quot;overflow&quot;:&quot;hidden&quot;,&quot;text-overflow&quot;:&quot;ellipsis&quot;,&quot;display&quot;:&quot;flex&quot;,&quot;border-radius&quot;:&quot;16px&quot;,&quot;height&quot;:&quot;24px&quot;,&quot;align-items&quot;:&quot;center&quot;,&quot;white-space&quot;:&quot;nowrap&quot;,&quot;margin&quot;:&quot;4px 4px 4px 4px&quot;},&quot;attributes&quot;:{&quot;class&quot;:{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;NA&quot;]},&quot;sp-field-fontSizeSmall&quot;,{&quot;operator&quot;:&quot;:&quot;,&quot;operands&quot;:[{&quot;operator&quot;:&quot;==&quot;,&quot;operands&quot;:[&quot;@currentField&quot;,&quot;&quot;]},&quot;&quot;,&quot;sp-field-borderAllRegular sp-field-borderAllSolid sp-css-borderColor-neutralSecondary&quot;]}]}},&quot;txtContent&quot;:&quot;@currentField&quot;}],&quot;templateId&quot;:&quot;BgColorChoicePill&quot;}' Description='Task&#39;s category' DisplayName='Category' FillInChoice='TRUE' Format='Dropdown' IsModern='TRUE' Name='Category' Title='Category' Type='Choice'><CHOICES><CHOICE>NA</CHOICE></CHOICES></Field>`
        );
        notifyOnFieldCreation(category);

        const priority = await list.fields.createFieldAsXml(
            `<Field Description='Task&#39;s priority' DisplayName='Priority' FillInChoice='FALSE' Format='Dropdown' IsModern='TRUE' Name='Priority' Title='Priority' Required='TRUE' Type='Choice'><CHOICES><CHOICE>None</CHOICE><CHOICE>Low</CHOICE><CHOICE>Medium</CHOICE><CHOICE>High</CHOICE></CHOICES></Field>`
        );
        notifyOnFieldCreation(priority);

        const responsible = await list.fields.createFieldAsXml(`<Field Description='Users responsible for executing current task' DisplayName='Responsible' Format='Dropdown' IsModern='TRUE' List='UserInfo' Mult='TRUE' Name='Responsible' Title='Responsible' Type='User' UserDisplayOptions='NamePhoto' UserSelectionMode='1' UserSelectionScope='0'></Field>`);
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
            `<Field DisplayName='StartDate' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='StartDate' Required='FALSE' Title='StartDate' Type='DateTime'></Field>`
        );
        notifyOnFieldCreation(startDate);

        const finishDate = await list.fields.createFieldAsXml(
            `<Field DisplayName='FinishDate' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='FinishDate' Required='FALSE' Title='FinishDate' Type='DateTime'></Field>`
        );
        notifyOnFieldCreation(finishDate);

        const dueDate = await list.fields.createFieldAsXml(
            `<Field DisplayName='DueDate' FriendlyDisplayFormat='Disabled' Format='DateTime' IsModern='TRUE' Name='DueDate' Required='TRUE' Title='DueDate' Type='DateTime'></Field>`
        );
        notifyOnFieldCreation(dueDate);

        const progress = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='TRUE' CustomUnitOnRight='TRUE' Description='Progress in percentage (from 0 to 100 %)' DisplayName='Progress' Format='Dropdown' IsModern='TRUE' Max='100' Min='0' Name='Progress' Percentage='TRUE' Required='TRUE' Title='Progress' Type='Number' Unit='Percentage'><Default>0</Default></Field>`
        );
        notifyOnFieldCreation(progress);

        const estimated = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitName='hour(s)' CustomUnitOnRight='TRUE' Decimals='0' Description='Estimated time (in hours) for completion of this task and all of it&#39;s subtasks.' DisplayName='EstimatedTime' Format='Dropdown' IsModern='TRUE' Name='EstimatedTime' Percentage='FALSE' Required='TRUE' Title='EstimatedTime' Type='Number' Unit='Custom'></Field>`
        );
        notifyOnFieldCreation(estimated);

        const effective = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitName='hour(s)' CustomUnitOnRight='TRUE' Decimals='0' Description='Actual time (in hours) required to complete this task' DisplayName='EffectiveTime' Format='Dropdown' IsModern='TRUE' Name='EffectiveTime' Percentage='FALSE' Required='TRUE' Title='EffectiveTime' Type='Number' Unit='Custom'><Default>0</Default></Field>`
        );
        notifyOnFieldCreation(effective);

        const parent = await list.fields.createFieldAsXml(
            `<Field Description='Link to parent task' DisplayName='Parent' Format='Dropdown' Indexed='TRUE' IsModern='TRUE' IsRelationship='TRUE' List='${taskList.data.Id}' Name='Parent' RelationshipDeleteBehavior='Restrict' ShowField='Title' Title='Parent' Type='Lookup'></Field>`
        );
        notifyOnFieldCreation(parent)

        const main = await list.fields.createFieldAsXml(
            `<Field Description='Link to main (top) task' DisplayName='MainTask' Format='Dropdown' Indexed='TRUE' IsModern='TRUE' IsRelationship='TRUE' List='${taskList.data.Id}' Name='MainTask' RelationshipDeleteBehavior='Restrict' ShowField='Title' Title='MainTask' Type='Lookup'></Field>`
        );
        notifyOnFieldCreation(main)

        /** Comments hidden field */
        const commentsListDetails = await commentList.list();
        const comments = await list.fields.createFieldAsXml(
            `<Field Description='Item comments' DisplayName='Comments' Format='Dropdown' Indexed='FALSE' IsModern='TRUE' IsRelationship='FALSE' List='${commentsListDetails.Id}' Mult='TRUE' Name='Comments' ShowField='ID' Title='Comments' Type='LookupMulti'></Field>`
        )
        notifyOnFieldCreation(comments)

        const subtasks = await list.fields.createFieldAsXml(
            `<Field Description='This task&#39;s children' DisplayName='Subtasks' Format='Dropdown' Indexed='FALSE' IsModern='TRUE' IsRelationship='FALSE' List='${taskList.data.Id}' Mult='TRUE' Name='Subtasks' ShowField='ID' Title='Subtasks' Type='LookupMulti'></Field>`
        );
        notifyOnFieldCreation(subtasks)

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
                        <FieldRef Name=\"${priority.data.InternalName}\"/>
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
        SPnotify({
            message: 'Task list was created successfully',
            messageType: MessageBarType.success,
        });
    } else {
        SPnotify({
            message: 'Task list is already created. Skipping...',
            messageType: MessageBarType.info,
        });
    }
}

function notifyOnFieldCreation(field: IFieldAddResult) {
    SPnotify({
        message: `Field '${field.data.Title}' added successfully`,
        messageType: MessageBarType.success,
    });
}

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
    const commentList = await sp.web.lists.ensure(props.config.commentListName);

    if (commentList.created) {
        /** Set title not required */
        const titleField = commentList.list.fields.getByTitle('Title');
        await titleField.update({
            Hidden: true,
            Required: false,
        });

        /** List id */
        const listId = await commentList.list.fields.createFieldAsXml(
            `<Field Indexed='TRUE' DisplayName='ListId' Format='Dropdown' IsModern='TRUE' MaxLength='255' Name='ListId' Required='TRUE' Title='ListId' Type='Text'></Field>`
        );
        notifyOnFieldCreation(listId);

        /** Item id */
        const itemId = await commentList.list.fields.createFieldAsXml(
            `<Field Indexed='TRUE' CommaSeparator='TRUE' CustomUnitOnRight='TRUE' Decimals='0' Description='Id of the list item where comment was left' DisplayName='ItemId' Format='Dropdown' IsModern='TRUE' Name='ItemId' Percentage='FALSE' Required='TRUE' Title='ItemId' Type='Number' Unit='None'></Field>`
        );
        notifyOnFieldCreation(itemId);

        /** Comment contents */
        const comment = await commentList.list.fields.createFieldAsXml(
            `<Field AppendOnly='FALSE' Description='Comment contents' DisplayName='Comment' Format='Dropdown' IsModern='TRUE' IsolateStyles='FALSE' Name='Comment' Required='FALSE' RichText='FALSE' RichTextMode='Compatible' Title='Comment' Type='Note'></Field>`
        );
        notifyOnFieldCreation(comment);

        const activityType = await commentList.list.fields.createFieldAsXml(
            `<Field Description='Type of action (Ex: Comment, Status change, Time log..)' DisplayName='ActivityType' FillInChoice='FALSE' Format='Dropdown' IsModern='TRUE' Name='ActivityType' Required='TRUE' Title='ActivityType' Type='Choice'><CHOICES><CHOICE>Comment</CHOICE><CHOICE>Time log</CHOICE><CHOICE>Modify</CHOICE></CHOICES></Field>`
        );
        notifyOnFieldCreation(activityType);

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
                        <FieldRef Name=\"${activityType.data.InternalName}\"/>
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
    const taskList = await sp.web.lists.ensure(props.config.listName);
    
    if (taskList.created) {
        SPnotify({
            message: 'Please wait. Creating lists',
            messageType: MessageBarType.warning,
        });

        const list = sp.web.lists.getByTitle(props.config.listName);
        
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

        const responsible = await list.fields.createFieldAsXml(`<Field Description='Users responsible for executing current task' Indexed="TRUE" DisplayName='Responsible' Format='Dropdown' IsModern='TRUE' List='UserInfo' Mult='FALSE' Name='Responsible' Title='Responsible' Type='User' UserDisplayOptions='NamePhoto' UserSelectionMode='1' UserSelectionScope='0'></Field>`);
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
            `<Field Description='Link to parent task' DisplayName='Parent' Format='Dropdown' Indexed='TRUE' IsModern='TRUE' IsRelationship='TRUE' List='${taskList.data.Id}' Name='Parent' RelationshipDeleteBehavior='Cascade' ShowField='Title' Title='Parent' Type='Lookup'></Field>`
        );
        notifyOnFieldCreation(parent)

        const main = await list.fields.createFieldAsXml(
            `<Field Description='Link to main (top) task' DisplayName='MainTask' Format='Dropdown' Indexed='TRUE' IsModern='TRUE' IsRelationship='TRUE' List='${taskList.data.Id}' Name='MainTask' RelationshipDeleteBehavior='Cascade' ShowField='Title' Title='MainTask' Type='Lookup'></Field>`
        );
        notifyOnFieldCreation(main)

        const subtasks = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitOnRight='TRUE' Decimals='0' Description='Number of subtasks' DisplayName='Subtasks' Format='Dropdown' IsModern='TRUE' Name='Subtasks' Percentage='FALSE' Title='Subtasks' Type='Number' Unit='None'><Default>0</Default></Field>`
        )
        notifyOnFieldCreation(subtasks);

        const finishedSubtasks = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitOnRight='TRUE' Decimals='0' Description='Number of finished subtasks' DisplayName='FinishedSubtasks' Format='Dropdown' IsModern='TRUE' Name='FinishedSubtasks' Percentage='FALSE' Title='FinishedSubtasks' Type='Number' Unit='None'><Default>0</Default></Field>`
        );
        notifyOnFieldCreation(finishedSubtasks);

        const commentsCount = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitOnRight='TRUE' Decimals='0' Description='Number of comments' DisplayName='CommentsCount' Format='Dropdown' IsModern='TRUE' Min='0' Name='CommentsCount' Percentage='FALSE' Title='CommentsCount' Type='Number' Unit='None'><Default>0</Default></Field>`
        );
        notifyOnFieldCreation(commentsCount);

        const attachmentsCount = await list.fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' CustomUnitOnRight='TRUE' Decimals='0' Description='Number of attachments' DisplayName='AttachmentsCount' Format='Dropdown' IsModern='TRUE' Min='0' Name='AttachmentsCount' Percentage='FALSE' Title='AttachmentsCount' Type='Number' Unit='None'><Default>0</Default></Field>`
        );
        notifyOnFieldCreation(attachmentsCount);

        const remoteInfo = await list.fields.createFieldAsXml(
            `<Field DisplayName='RemoteInfo' Format='Dropdown' IsModern='TRUE' MaxLength='255' Name='RemoteInfo' Title='RemoteInfo' Type='Text'></Field>`
        );
        notifyOnFieldCreation(remoteInfo);
        
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
                        <FieldRef Name=\"${remoteInfo.data.InternalName}\"/>
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

    const attachmentsLibrary = await sp.web.lists.ensure(props.config.attachmentsPath, 'CIP Attachments', 101, false, { OnQuickLaunch: false });

    if (attachmentsLibrary.created) {
        const taskName = await attachmentsLibrary.list.fields.createFieldAsXml(
            `<Field Description='Task title' DisplayName='Task' Format='Dropdown' IsModern='TRUE' MaxLength='255' Name='Task' Required='TRUE' Title='Task' Type='Text'></Field>`
        );
        notifyOnFieldCreation(taskName);

        const commentId = await attachmentsLibrary.list.fields.createFieldAsXml(
            `<Field Indexed='TRUE' CommaSeparator='TRUE' CustomUnitOnRight='TRUE' DisplayName='CommentId' Format='Dropdown' IsModern='TRUE' Name='CommentId' Percentage='FALSE' Title='CommentId' Type='Number' Unit='None'></Field>`
        );
        notifyOnFieldCreation(commentId);

        const view = await attachmentsLibrary.list.defaultView();
        await attachmentsLibrary.list.defaultView.setViewXml(
            `<View 
                Name=\"${view.Id}\" 
                DefaultView=\"TRUE\" 
                MobileView=\"TRUE\" 
                MobileDefaultView=\"TRUE\" 
                Type=\"HTML\" 
                DisplayName=\"All Documents\" 
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
                        <FieldRef Name=\"DocIcon\"/>
                        <FieldRef Name=\"LinkFilename\"/>
                        <FieldRef Name=\"${taskName.data.InternalName}\"/>
                        <FieldRef Name=\"Modified\"/>
                        <FieldRef Name=\"Editor\"/>
                        <FieldRef Name=\"${commentId.data.InternalName}\"/>
                    </ViewFields>
                    <RowLimit Paged=\"TRUE\">30</RowLimit>
                    <JSLink>clienttemplates.js</JSLink>
                    <XslLink Default=\"TRUE\">main.xsl</XslLink>
                    <Toolbar Type=\"Standard\"/>
                    <ViewType2>COMPACTLIST</ViewType2>
            </View>`
        );

        SPnotify({
            message: 'Attachments library was created',
            messageType: MessageBarType.success,
        });
    } else {

        SPnotify({
            message: 'Attachments library is already created. Skipping...',
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

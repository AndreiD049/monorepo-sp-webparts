import { IFieldAddResult, IList, IListInfo, SPFI } from 'sp-preset';

export interface IFieldOptions {
    name: string;
    description?: string;
    indexed?: boolean;
    required?: boolean;
}

export interface ILookupFieldOptions extends IFieldOptions {
    // <Field DisplayName='Customer' Format='Dropdown' Indexed='FALSE' IsModern='TRUE' IsRelationship='FALSE' List='1aba3dea-a312-4bf2-b964-612e20fa0797' Mult='TRUE' Name='Customer' ShowField='Customer' Title='Customer' Type='LookupMulti'></Field>
    IsRelationship?: boolean;
    ListId: string;
    LookupColumn: string;
    type: 'Lookup' | 'LookupMulti';
}

export interface INumberFieldOptions extends IFieldOptions {
    min?: number;
    max?: number;
}

export interface IStringFieldOptions extends IFieldOptions {
    maxLength?: number;
}

export interface IDateFieldOptions extends IFieldOptions {
    format: 'DateOnly' | 'DateTime';
}

export interface IChoiceFieldOptions extends IFieldOptions {
    type: 'Choice' | 'MultiChoice';
    choices: string[];
    allowFillIn?: boolean;
}

export class ListBuilder {
    private fields: IFieldAddResult[];
    public created: boolean;

    constructor(private listName: string, private sp: SPFI, private onNotify: (message: string) => void = () => null) {
        this.fields = [];
        this.created = false;
    }

    public async ensureList(): Promise<IListInfo> {
        const result = await this.sp.web.lists.ensure(this.listName);
        const title = this.getList().fields.getByTitle('Title');
        await title.update({
            Hidden: true,
            Required: false,
        });
        this.onNotify(`List ${this.listName} created!`);
        this.created = result.created;
        return result.data;
    }

    public async addTextField(options: IStringFieldOptions) {
        const required = Boolean(options.required);
        const indexed = Boolean(options.indexed);
        const field = await this.getList().fields.createFieldAsXml(
            `<Field Indexed='${String(indexed).toUpperCase()}' DisplayName='${options.name}' Format='Dropdown' IsModern='TRUE' MaxLength='${options.maxLength || 255}' Name='${options.name}' Required='${String(required).toUpperCase()}' Title='${options.name}' Type='Text'></Field>`
        );
        this.fields.push(field);
        this.onNotify(`Field ${field.data.InternalName} created!`);
    }

    public async addNumberField(options: INumberFieldOptions) {
        const required = Boolean(options.required);
        const indexed = Boolean(options.indexed);
        const field = await this.getList().fields.createFieldAsXml(
            `<Field CommaSeparator='FALSE' Required='${required}' Indexed='${indexed}' CustomUnitOnRight='TRUE' Description='${options.description}' DisplayName='${options.name}' Format='Dropdown' IsModern='TRUE' ${ options.max ? `Max='${options.max}'` : '' } ${ options.min ? `Min='${options.min}'` : '' } Name='${options.name}' Percentage='FALSE' Title='${options.name}' Type='Number' Unit='None'></Field>`
        );
        this.fields.push(field);
        this.onNotify(`Field ${field.data.InternalName} created!`);
    }

    public async addTextMultilineField(options: IFieldOptions) {
        const required = Boolean(options.required);
        const field = await this.getList().fields.createFieldAsXml(
            `<Field Indexed='FALSE' AppendOnly='FALSE' Description='${options.description}' DisplayName='${options.name}' Format='Dropdown' IsModern='TRUE' IsolateStyles='FALSE' Name='${options.name}' Required='${String(required).toUpperCase()}' RichText='FALSE' RichTextMode='Compatible' Title='${options.name}' Type='Note'></Field>`
        );
        this.fields.push(field);
        this.onNotify(`Field ${field.data.InternalName} created!`);
    }

    public async addUserField(options: IFieldOptions) {
        const required = Boolean(options.required);
        const indexed = Boolean(options.indexed);
        const field = await this.getList().fields.createFieldAsXml(
            `<Field REQUIRED='${String(required).toUpperCase()}' Indexed='${String(indexed).toUpperCase()}' Description='${options.description}' DisplayName='${options.name}' Format='Dropdown' IsModern='TRUE' List='UserInfo' Name='${options.name}' Title='${options.name}' Type='User' UserSelectionMode='0' UserSelectionScope='0'></Field>`
        );
        this.fields.push(field);
        this.onNotify(`Field ${field.data.InternalName} created!`);
    }

    public async addDateField(options: IDateFieldOptions) {
        const required = Boolean(options.required);
        const indexed = Boolean(options.indexed);
        const field = await this.getList().fields.createFieldAsXml(
            `<Field Indexed='${String(indexed).toUpperCase()}' Required='${String(required).toUpperCase()}' DisplayName='${options.name}' FriendlyDisplayFormat='Disabled' Format='${options.format}' IsModern='TRUE' Name='${options.name}' Title='${options.name}' Type='DateTime'></Field>`
        );
        this.fields.push(field);
        this.onNotify(`Field ${field.data.InternalName} created!`);
    }

    public async addChoiceField(options: IChoiceFieldOptions) {
        const required = Boolean(options.required);
        const indexed = Boolean(options.indexed);
        const allowFillIn = Boolean(options.allowFillIn);
        const choiceBody = options.choices.reduce((prev, cur) => `${prev}<CHOICE>${cur}</CHOICE>`, '');
        const field = await this.getList().fields.createFieldAsXml(
            `<Field Description='${options.description}' DisplayName='${options.name}' FillInChoice='${allowFillIn}' Format='Dropdown' IsModern='TRUE' Name='${options.name}' Required='${String(required).toUpperCase()}' Title='${options.name}' Type='${options.type}'><CHOICES>${choiceBody}</CHOICES></Field>`
        );
        this.fields.push(field);
        this.onNotify(`Field ${field.data.InternalName} created!`);
    }

    public async addLookupField(options: ILookupFieldOptions) {
        const required = Boolean(options.required);
        const indexed = Boolean(options.indexed);
        const isRelationship = Boolean(options.IsRelationship);
        const field = await this.getList().fields.createFieldAsXml(
            `<Field DisplayName='${options.name}' Required='${String(required).toUpperCase()}' Format='Dropdown' Indexed='${String(indexed).toUpperCase()}' IsModern='TRUE' IsRelationship='${String(isRelationship).toUpperCase()}' List='${options.ListId}' Mult='${options.type === 'LookupMulti' ? 'TRUE' : 'FALSE'}' Name='${options.name}' ShowField='${options.LookupColumn}' Title='${options.name}' Type='${options.type}'></Field>`
        );
        this.fields.push(field);
        this.onNotify(`Field ${field.data.InternalName} created!`);
    }

    public async createView() {
        const view = await this.getList().defaultView();
        const body = this.fields.reduce((prevValue, currentValue) => prevValue + `<FieldRef Name="${currentValue.data.InternalName}"/>`, '');
        await this.getList().defaultView.setViewXml(
            `<View 
                Name="${view.Id}" 
                DefaultView="TRUE" 
                MobileView="TRUE" 
                MobileDefaultView="TRUE" 
                Type="HTML" 
                DisplayName="All Items" 
                Url="${view.ServerRelativeUrl}" 
                Level="1" 
                BaseViewID="1" 
                ContentTypeID="0x" 
                ImageUrl="${view.ImageUrl}">
                    <Query>
                        <OrderBy>
                            <FieldRef Name="ID"/>
                        </OrderBy>
                    </Query>
                    <ViewFields>
                        ${body}
                        <FieldRef Name="Author"/>
                        <FieldRef Name="Created"/>
                    </ViewFields>
                    <RowLimit Paged="TRUE">30</RowLimit>
                    <JSLink>clienttemplates.js</JSLink>
                    <XslLink Default="TRUE">main.xsl</XslLink>
                    <Toolbar Type="Standard"/>
                    <ViewType2>COMPACTLIST</ViewType2>
            </View>`
        );
        this.onNotify(`View created!`);
    }

    private getList(): IList {
        return this.sp.web.lists.getByTitle(this.listName);
    }
}

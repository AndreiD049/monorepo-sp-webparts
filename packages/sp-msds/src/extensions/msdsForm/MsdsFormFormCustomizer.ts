import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FormDisplayMode, Log } from '@microsoft/sp-core-library';
import { BaseFormCustomizer } from '@microsoft/sp-listview-extensibility';

import SPBuilder, { InjectHeaders } from 'sp-preset';

import { IMsdsFormProps, MsdsForm } from './components/MsdsForm';
import { LookupService } from './services/lookup-service';
import { ItemService } from './services/item-service';
import './styles.scss';
import { IMSDSRequest } from './services/IMSDSRequest';
import { FieldService } from './services/field-service';

/**
 * If your form customizer uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IMsdsFormFormCustomizerProperties {
    // This is an example; replace with your own property
    rootSite: string;
    approverListName: string;
    CommentSection?: React.FC;
}

const LOG_SOURCE: string = 'MsdsFormFormCustomizer';

export default class MsdsFormFormCustomizer extends BaseFormCustomizer<IMsdsFormFormCustomizerProperties> {
    public static SPBuilder: SPBuilder = null;
    // Added for the item to show in the form; use with edit and view form
    private _item: IMSDSRequest = null;
    // Added for item's etag to ensure integrity of the update; used with edit form
    private _etag?: string = null;

    public async onInit(): Promise<void> {
        // Add your custom initialization to this method. The framework will wait
        // for the returned promise to resolve before rendering the form.
        Log.info(
            LOG_SOURCE,
            'Activated MsdsFormFormCustomizer with properties:'
        );
        Log.info(LOG_SOURCE, JSON.stringify(this.properties, undefined, 2));
        MsdsFormFormCustomizer.SPBuilder = new SPBuilder(this.context)
            .withRPM(600)
            .withAdditionalTimelines([
                InjectHeaders({
                    UserAgent: `NONISV|Katoen Natie|MSDS/1.0`,
                }),
            ]);
        LookupService.InitService(
            MsdsFormFormCustomizer.SPBuilder.getSP(),
            this.properties
        );
        ItemService.InitService(MsdsFormFormCustomizer.SPBuilder.getSP());
        FieldService.InitService(MsdsFormFormCustomizer.SPBuilder.getSP());

        if (this.displayMode !== FormDisplayMode.New) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._etag = JSON.parse((this.context.item as any)['@odata.etag']);
            this._item = this.context.item as unknown as IMSDSRequest;
            // Import the comment section chunk only if it's Edit or Display mode
            await import(
                /* webpackChunkName: 'CommentSection' */
                './components/CommentSection'
            ).then((module) => {
                this.properties.CommentSection = module.CommentSection;
            });
        }
        return Promise.resolve();
    }

    public render(): void {
        // Use this method to perform your custom rendering.
        const msdsForm: React.ReactElement<{}> = React.createElement(MsdsForm, {
            context: this.context,
            displayMode: this.displayMode,
            onSave: this._onSave,
            onClose: this._onClose,
            item: this._item,
            etag: this._etag,
            CommentSection: this.properties.CommentSection
        } as IMsdsFormProps);

        ReactDOM.render(msdsForm, this.domElement);
    }

    public onDispose(): void {
        // This method should be used to free any resources that were allocated during rendering.
        ReactDOM.unmountComponentAtNode(this.domElement);
        super.onDispose();
    }

    private _onSave = (): void => {
        // You MUST call this.formSaved() after you save the form.
        this.formSaved();
    };

    private _onClose = (): void => {
        // You MUST call this.formClosed() after you close the form.
        this.formClosed();
    };
}

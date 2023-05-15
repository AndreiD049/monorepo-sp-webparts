import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
	IPropertyPaneConfiguration,
	PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'SandboxWebPartStrings';
import { Sandbox } from './components/Sandbox';
import { ISandboxProps } from './components/ISandboxProps';
import SPBuilder from 'sp-preset';

export interface ISandboxWebPartProps {
	description: string;
}

export interface ISampleData {
	ID: number;
	Title: string;
	Samples: number;
}

export default class SandboxWebPart extends BaseClientSideWebPart<ISandboxWebPartProps> {
	public static SPBuilder: SPBuilder;
	private _isDarkTheme: boolean = false;
	private _environmentMessage: string = '';

	public render(): void {
		const element: React.ReactElement<ISandboxProps> = React.createElement(
			Sandbox,
			{
				description: this.properties.description,
				isDarkTheme: this._isDarkTheme,
				environmentMessage: this._environmentMessage,
				hasTeamsContext: !!this.context.sdks.microsoftTeams,
				userDisplayName: this.context.pageContext.user.displayName
			}
		);

		ReactDom.render(element, this.domElement);
	}

	protected async onInit(): Promise<void> {
		console.log('init');

		SandboxWebPart.SPBuilder = new SPBuilder(this.context);
	}



	protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
		if (!currentTheme) {
			return;
		}

		this._isDarkTheme = !!currentTheme.isInverted;
		const {
			semanticColors
		} = currentTheme;

		if (semanticColors) {
			this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
			this.domElement.style.setProperty('--link', semanticColors.link || null);
			this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
		}

	}

	protected onDispose(): void {
		ReactDom.unmountComponentAtNode(this.domElement);
	}

	protected get dataVersion(): Version {
		return Version.parse('1.0');
	}

	protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
		return {
			pages: [
				{
					header: {
						description: strings.PropertyPaneDescription
					},
					groups: [
						{
							groupName: strings.BasicGroupName,
							groupFields: [
								PropertyPaneTextField('description', {
									label: strings.DescriptionFieldLabel
								})
							]
						}
					]
				}
			]
		};
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { SuggestionOptions } from '@tiptap/suggestion';
import { ISiteUserInfo } from 'sp-preset';

import MentionList from './MentionList';
import { ReactRenderer } from '@tiptap/react';
import { CALLOUT_ID } from '.';
import { hideCallout, showCallout, updateCalloutContent } from '../Callout';

export interface ISuggestion extends Omit<SuggestionOptions, 'editor'> {
  users: ISiteUserInfo[];
  setUsers: (this: ISuggestion, users: ISiteUserInfo[]) => ISuggestion;
}

const suggestion: ISuggestion = {
    users : [],
    setUsers: function(users) {
      this.users = users;
      return this;
    },
    items: (function({ query }: { query: string }): string[] {
        return this.users
            .filter((item: ISiteUserInfo) =>
                item.Title.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 5);
    }),
    render: function() {
        let component: ReactRenderer<{ onKeyDown: (ev: any) => boolean }, any>;

        return {
            onStart: (props: any) => {
                component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                });

                if (!props.clientRect) {
                    return;
                }

                showCallout({
                  id: CALLOUT_ID,
                  calloutProps: {
                    target: props.clientRect(),
                    directionalHint: 4,
                    isBeakVisible: false,
                  },
                  content: component.reactElement,
                })
            },

            onUpdate(props: any) {
                component.updateProps(props);

                if (!props.clientRect) {
                    return;
                }

                updateCalloutContent(CALLOUT_ID, component.reactElement);
            },

            onKeyDown(props: any) {
                if (props.event.key === 'Escape') {
                    hideCallout(CALLOUT_ID);

                    return true;
                }

                return component.ref?.onKeyDown(props);
            },

            onExit() {
                hideCallout(CALLOUT_ID);
                component.destroy();
            },
        };
    }
};

// ensure correct 'this' is used
suggestion.items = suggestion.items.bind(suggestion);
suggestion.render = suggestion.render.bind(suggestion);

export default suggestion;

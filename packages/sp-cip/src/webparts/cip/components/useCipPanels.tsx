import { PanelType } from "office-ui-fabric-react"
import * as React from "react";
import CreateTaskPanel from "../tasks/Panels/CreateTask"
import usePanel from "./usePanel"

export const CREATE_PANEL_ID = 'create';

export const useCipPanels = () => {
    const createPanel = usePanel({
        id: CREATE_PANEL_ID,
        RenderComponent: CreateTaskPanel,
        isLightDismiss: true,
        headerText: 'Create task',
        isFooterAtBottom: true,
        type: PanelType.medium,
    });

    return (
        <>
            {createPanel.PanelComponent}
        </>
    );
};

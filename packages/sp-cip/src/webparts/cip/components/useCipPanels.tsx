import { PanelType } from "office-ui-fabric-react"
import * as React from "react";
import CreateTaskPanel from "../tasks/Panels/CreateTask"
import { TaskDetails } from "../tasks/Panels/TaskDetails";
import usePanel from "./usePanel"

export const CREATE_PANEL_ID = 'sp-cip-create-panel';
export const DETAILS_PANEL_ID = 'sp-cip-details-panel';

export const useCipPanels = () => {
    const createPanel = usePanel({
        id: CREATE_PANEL_ID,
        RenderComponent: CreateTaskPanel,
        isLightDismiss: true,
        headerText: 'Create task',
        isFooterAtBottom: true,
        type: PanelType.medium,
    });

    const detailsPanel = usePanel({
        id: DETAILS_PANEL_ID,
        RenderComponent: TaskDetails,
        isLightDismiss: true,
        isFooterAtBottom: true,
        type: PanelType.medium,
    })

    return (
        <>
            {createPanel.PanelComponent}
            {detailsPanel.PanelComponent}
        </>
    );
};

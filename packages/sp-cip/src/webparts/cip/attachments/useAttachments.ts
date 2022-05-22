import * as React from "react";
import CipWebPart from "../CipWebPart";
import { GlobalContext } from "../utils/GlobalContext";

export const useAttachments = () => {
    const { properties } = React.useContext(GlobalContext);
    const sp = React.useMemo(() => CipWebPart.SPBuilder.getSP('Data'), []);
    const list = sp.web.getFolderByServerRelativePath(properties.attachmentsPath);
};

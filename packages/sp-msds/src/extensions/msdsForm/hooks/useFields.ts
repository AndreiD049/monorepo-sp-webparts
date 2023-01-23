import * as React from "react";
import { FieldService } from "../services/field-service";
import { IMSDSFields } from "../services/IMSDSFields";

export function useFields(site: string | undefined): IMSDSFields {
    const [fields, setFields] = React.useState([]);
    
    React.useEffect(() => {
        if (site) {
            FieldService.getFields(site).then((value) => setFields(value)).catch((err) => console.error(err));
        }       
    }, [site]);
    
    return fields.length > 0 ? fields[0] : {};
}
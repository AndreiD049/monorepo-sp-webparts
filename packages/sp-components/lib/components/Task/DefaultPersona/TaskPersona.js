import { Persona, PersonaSize } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './TaskPersona.module.scss';
export var TaskPersona = function (props) {
    return (React.createElement("div", { className: "".concat(styles['Task__persona'], " ").concat(styles['Task__persona_size_sm']) },
        React.createElement(Persona, { className: props.className, text: props.title, size: PersonaSize.size24, title: props.email, hidePersonaDetails: true })));
};
//# sourceMappingURL=TaskPersona.js.map
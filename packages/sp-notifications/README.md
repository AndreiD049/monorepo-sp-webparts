# sp-notification
Simple notification package for Sharepoint Framework React Webparts

# Install

```bash
npm install sp-react-notifications
```

# Dependencies

Project is supposed to be used within [Sharepoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview) react WebParts, and it assumes following packages:

* react & react-dom ^16.13.1
* office-ui-fabric-react ^7.174.1
* @microsoft/sp-core-library ^1.12.1

# Usage

```typescript
import { SPnotify } from 'sp-notifications';

// ...

<button onClick={() => SPnotify({
    // text shown on the notification, can also be a ReactElement for more sophisticated notifications
    message: "Test message",
    // constant from office-ui-fabric-react. Optional, default = info
    messageType: MessageBarType.severeWarning, 
    // buttons shown on the notification. Optional, default = true
    isMultiline: false,
    // Timeout (in miliseconds) after withc the notification is dismissed. Optional, default = 5000
    timeout: 5000,
    // Additional buttons appearing on the notification. Optional, default []
    messageActions: [ 
        {
            text: 'Yes',
            onClick: () => console.log('text'),
            dismiss: true,
        },
        {
            text: 'No',
            onClick: () => console.log('notext'),
        }
    ]
})}>
    notify me
</button>
```

<img src="https://github.com/AndreiD049/sp-react-notifications/blob/main/assets/sample.gif?raw=true">
module.exports = [
    {
        type: 'list',
        name: 'props',
        message: 'Input a list of properties. Ex: name: string, age: number',
    },
    {
        type: 'toggle',
        name: 'export',
        messge: 'Export interface?',
        enabled: 'yes',
        disabled: 'no'
    },
    {
        type: 'toggle',
        name: 'default',
        messge: 'Export as default?',
        enabled: 'yes',
        disabled: 'no'
    }
]
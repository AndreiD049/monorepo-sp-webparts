module.exports = [
    {
        type: 'input',
        name: 'list',
        message: 'List title'
    },
    {
        type: 'select',
        name: 'type',
        message: 'Select the type of the field',
        choices: ['number', 'date', 'text single line', 'text multiline', 'boolean', 'lookup']
    },
    {
        type: 'input',
        name: 'description',
        message: 'Select the field description',
    },
    {
        type: 'confirm',
        name: 'indexed',
        message: 'Is the field indexed?',
    },
    {
        type: 'confirm',
        name: 'required',
        message: 'Is the field required?',
    },
]
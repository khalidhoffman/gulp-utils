
function BlockTemplate(method){
    switch(method){
        case 'lib':
            return "+block('%s')";
        case 'stylus-bem':
        default:
            return ".%s";
    }
}

function ModTemplate(method){
    switch(method){
        case 'lib':
            return "+mod('%s')";
        case 'stylus-bem':
            return "/--%s";
        default:
            return "\&--%s";
    }
}

function ElementTemplate(method){
    switch(method){
        case 'lib':
            return "+element('%s')";
        case 'stylus-bem':
            return "/__%s";
        default:
            return "\&__%s";
    }
}

function ModElementTemplate(method){
    switch(method){
        case 'lib':
            return "+mod-element('%s')";
        case 'stylus-bem':
            return "/__%s";
        default:
            return "\&__%s";
    }
}

module.exports = {
    Block: BlockTemplate,
    Mod: ModTemplate,
    Element: ElementTemplate,
    ModElement: ModElementTemplate
};


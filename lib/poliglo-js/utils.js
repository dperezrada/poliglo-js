var _ =  require('lodash');
var poliglo_utils = {};


poliglo_utils.select_dict_el = function(data, key_expr, default_value){
    var curr_el = data;
    var splitted_data = key_expr.split('.');
    for(var key_index in splitted_data){
        var key = splitted_data[key_index];
        if(!curr_el[key])
            return default_value;
        curr_el = curr_el[key];
    }
    return curr_el;
};

poliglo_utils.set_dict_el = function(data, key_expr, value){
    var curr_el = data;
    var splitted_data = key_expr.split('.');
    var final_key = _.last(splitted_data);

    for(var key_index=0; key_index < splitted_data.length - 1; key_index++){
        var key = splitted_data[key_index];
        if(!curr_el[key])
            curr_el[key] = {};
        curr_el = curr_el[key];
    }
    curr_el[final_key] = value;
};
poliglo_utils.to_json = function(data){
    return JSON.stringify(data);
};
poliglo_utils.json_loads = function(json){
    return JSON.parse(json);
};



for (var key in poliglo_utils) {
  exports[key] = poliglo_utils[key];
}

var poliglo = require('poliglo');

describe("Test Utils", function() {
    var data;
    beforeEach(function() {
        data = {'lala': {'hello': 'This is great'}};
    });

    it("test_select_not_exists_path", function() {
        var result = poliglo.utils.select_dict_el(data, 'not.exists');
        expected = null;
        expect(result).toEqual(expected);
    });
    it("test_not_exists_path_default_return", function() {
        var result = poliglo.utils.select_dict_el(data, 'not.exists', 'My Default');
        expected = 'My Default';
        expect(result).toEqual(expected);
    });
    it("test_get_correct_path", function() {
        var result = poliglo.utils.select_dict_el(data, 'lala.hello');
        expected = 'This is great';
        expect(result).toEqual(expected);
    });
    it("test_set_dict_el_correct_path", function() {
        poliglo.utils.set_dict_el(data, 'lala.bye', 'See you');
        var result = poliglo.utils.select_dict_el(data, 'lala.bye');
        expected = 'See you';
        expect(result).toEqual(expected);
    });
    it("test_set_dict_el_not_existing_path", function() {
        poliglo.utils.set_dict_el(data, 'lala.hasta.la.vista', 'Baby');
        var result = poliglo.utils.select_dict_el(data, 'lala.hasta.la.vista');
        expected = 'Baby';
        expect(result).toEqual(expected);
    });
});

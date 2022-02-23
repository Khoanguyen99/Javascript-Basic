// Constructor function
function Validator(options){
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var selectorRules = {};

    // Function do validate
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);  
        var errorMessage; 

        // Get rules of the selector
        var rules = selectorRules[rule.selector];

        // Loop through every rule and check
        // If have error, stop check.
        for (var i = 0; i < rules.length; ++i) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            
            if (errorMessage) break;
        }
        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }
        return !errorElement
    }

    // Get element of form need validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        // When submit form
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // Loop through and validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });
            if (isFormValid) {
                // Case: Submit with Javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (value, input) {
                        switch (input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                } 
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                // Case: Submit with default
                else {
                    formElement.submit();
                }
            }
        }
        // Loop through every rule and handle
        options.rules.forEach(function (rule) {
            // Save rules for every input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] =  [rule.test];
            }
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                if (inputElement) {
                    // Handle the case when blur leaves input
                    inputElement.onblur = function () {
                        validate(inputElement, rule);
                    }
                    // Handle the case when user enter value to the input
                    inputElement.oninput = function () {
                        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);  
                        errorElement.innerText = '';
                        getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                    }
                }
            });
        })
    }
}

// Define rules
// The principle of rules:
// 1. When have error => Return Message Error.
// 2. When not have error => Return undefined
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : 'Vui lòng nhập trường này!'
        }
    };
}
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là email!';
        }
    };
}
Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự!`;
        }
    };
}
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác!'
        }
    }
}
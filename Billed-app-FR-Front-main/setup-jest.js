import $ from 'jquery';
global.$ = global.jQuery = $;

module.exports = {
    setupFilesAfterEnv: ["jest-allure/dist/setup"]
}

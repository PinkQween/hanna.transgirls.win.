use crate::js_api;

pub fn cmd_date() -> Vec<String> {
    vec![js_api::get_date_time()]
}

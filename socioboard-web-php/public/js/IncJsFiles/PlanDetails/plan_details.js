let GET_ALL_PLANS_DATA = $("#all_plans_data").data('list');
let GET_USER_PLANS_DATA = $("#user_plan_data").data('list');

let plan_types = ["free_plan", "standerd_plan", "premium_plan", "deluxe_plan", "topaz_plan", "ruby_plan", "gold_plan", "plantinum_plan"];
let plan_color = ["primary", "success", "danger", "warning", "primary", "success", "danger", "warning"];

$(document).ready(function () {
        $("#home_tab").trigger('click');
    if (GET_ALL_PLANS_DATA.code === 200) {
        let x;
        let k = 0;
        let append = '';
        let selectedPlanType = '';
        let selectedPlanColor = '';
        $('#all_plans_data_id').empty();
        for (x of GET_ALL_PLANS_DATA.data) {
            selectedPlanType = '';
            selectedPlanColor = '';
            var planData = x;
            <!--begin: Pricing-->
            append += '<div class="col-md-6 col-xxl-3">' +
                '<div class="pt-30 pt-md-25 pb-15 px-5 text-center border-bottom">' +
                '<div class="d-flex flex-center position-relative mb-25">' +
                '<span class="svg svg-fill-primary opacity-4 position-absolute">' +
                '<svg width="175" height="200">' +
                '<polyline points="87,0 174,50 174,150 87,200 0,150 0,50 87,0" />' +
                '</svg>' +
                '</span>';
            switch (x.plan_name) {
                case "Basic":
                    selectedPlanType = plan_types[0];
                    selectedPlanColor = plan_color[0];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[0] + '">' +
                        '<i class="fas fa-paper-plane fa-5x ' + plan_types[0] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += 'FREE';
                    append += '<sup class="font-size-h3 font-weight-normal pl-1"></sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[0] + '">' + x.plan_name + '</h4>';
                    break;
                case "Standard":
                    selectedPlanType = plan_types[1];
                    selectedPlanColor = plan_color[1];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[1] + '">' +
                        '<i class="fas fa-gem fa-5x ' + plan_types[1] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += x.plan_price;
                    append += '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[1] + '">' + x.plan_name + '</h4>';
                    break;
                case "Premium":
                    selectedPlanType = plan_types[2];
                    selectedPlanColor = plan_color[2];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[2] + '">' +
                        '<i class="fas fa-gem fa-5x ' + plan_types[2] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += x.plan_price;
                    append += '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[2] + '">' + x.plan_name + '</h4>';
                    break;
                case "Deluxe":
                    selectedPlanType = plan_types[3];
                    selectedPlanColor = plan_color[3];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[3] + '">' +
                        '<i class="fas fa-gem fa-5x ' + plan_types[33] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += x.plan_price;
                    append += '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[3] + '">' + x.plan_name + '</h4>';
                    break;
                case "Topaz":
                    selectedPlanType = plan_types[4];
                    selectedPlanColor = plan_color[4];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[4] + '">' +
                        '<i class="fas fa-gem fa-5x ' + plan_types[4] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += x.plan_price;
                    append += '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[4] + '">' + x.plan_name + '</h4>';
                    break;
                case "Ruby":
                    selectedPlanType = plan_types[5];
                    selectedPlanColor = plan_color[5];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[5] + '">' +
                        '<i class="fas fa-gem fa-5x ' + plan_types[5] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += x.plan_price;
                    append += '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[5] + '">' + x.plan_name + '</h4>';
                    break;
                case "Gold":
                    selectedPlanType = plan_types[6];
                    selectedPlanColor = plan_color[6];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[6] + '">' +
                        '<i class="fas fa-gem fa-5x ' + plan_types[6] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += x.plan_price;
                    append += '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[6] + '">' + x.plan_name + '</h4>';
                    break;
                case "Platinum":
                    selectedPlanType = plan_types[7];
                    selectedPlanColor = plan_color[7];
                    append += '<span class="svg-icon svg-icon-5x svg-icon-' + plan_color[7] + '">' +
                        '<i class="fas fa-gem fa-5x ' + plan_types[7] + '"></i>' +
                        '</span>' +
                        '</div>' +
                        '<span class="font-size-h1 d-block font-weight-boldest py-2">';
                    append += x.plan_price;
                    append += '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>' +
                        '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + plan_types[7] + '">' + x.plan_name + '</h4>';
                    break;
            }
            append += '<p class="mb-15 d-flex flex-column">';
            if (x.plan_name == "Basic") append += '<span>Team Member - <b>' + x.member_count + '</b></span>';
            else append += '<span>Team Members - <b>' + x.member_count + '</b></span>';
            append += '<span class="mt-3">';
           append += '<a href="javascript:;"  data-toggle="modal" data-target="#plan_details_modal" onclick="morePlaneDetails( ' + k + ', \'' + selectedPlanType + '\' , \'' + selectedPlanColor + '\')"><span class="text-warning text-hover-primary"><i class="fas fa-info-circle fa-fw text-warning text-hover-primary"></i> Plan Details</span></a>';

            append += '</span>' +
                '</p>' +
                '<div class="d-flex justify-content-center">' +
                '<input type="hidden" id="plan_details' + k + '" value="' + JSON.stringify(x).replaceAll('"', "'") + '">' ;
            if (x.plan_id == GET_USER_PLANS_DATA.plan_id) append += '<button type="button" id="plan' + x.plan_id + '" class="btn bg-red text-uppercase font-weight-bolder px-15 py-3"> Current </button>';
            else if (x.plan_id > GET_USER_PLANS_DATA.plan_id) append += '<button type="button" id="plan' + x.plan_id + '" title="Click to update the plan details" class="btn bg-blue text-uppercase font-weight-bolder px-15 py-3" onclick="openPackagesPage()"> Upgrade </button>';
            else if (x.plan_id < GET_USER_PLANS_DATA.plan_id) append += '<button type="button" id="plan' + x.plan_id + '" title="Click to update the plan details" class="btn bg-blue text-uppercase font-weight-bolder px-15 py-3" onclick="openPackagesPage()"> Downgrade </button>';
            append += '</div>' +
                '</div>' +
                '</div>';
            k = k + 1;
            <!--end: Pricing-->
            $('#all_plans_data_id').append(append);
            append = "";
            $('#plan' + x.plan_id + '').tooltip();
        }
    }
});

function morePlaneDetails(k, selectedPlanType, selectedPlanColor) {
    let value = JSON.parse($("#plan_details" + k).val().replaceAll("'", '"'));
    let append = "";
    $('#selected_plan_Details_id').empty();
    append += '<div class="col-md-6 col-sm-12 text-center">' +
        '<div class="d-flex flex-center position-relative m-20">' +
        '<span class="svg svg-fill-primary opacity-4 position-absolute">' +
        '<svg width="175" height="200">' +
        '<polyline points="87,0 174,50 174,150 87,200 0,150 0,50 87,0" />' +
        '</svg>' +
        '</span>' +
        '<span class="svg-icon svg-icon-5x svg-icon-' + selectedPlanColor + '">';
    if (value.plan_name === "Basic") append += '<i class="fas fa-paper-plane fa-5x ' + selectedPlanType + '"></i>';
    else append += '<i class="fas fa-gem fa-5x ' + selectedPlanType + '"></i>';
    append += '</span>' +
        '</div>' +
        '<span class="font-size-h1 d-block font-weight-boldest py-2" id="plan_price_id">';
    if (value.plan_name === "Basic") append += 'FREE <sup class="font-size-h3 font-weight-normal pl-1"></sup></span>';
    else append += value.plan_price + '<sup class="font-size-h3 font-weight-normal pl-1">$</sup></span>';
    append += '<h4 class="font-size-h6 d-block font-weight-bold mb-7 ' + selectedPlanType + '" id="plan_name_id"> ' + value.plan_name + '</h4>';
    if (value.plan_id == GET_USER_PLANS_DATA.plan_id) append += '<button type="button" id="selected_plan_id' + value.plan_id + '" class="btn bg-red text-uppercase font-weight-bolder px-15 py-3"> Current </button>';
    else if(value.plan_id > GET_USER_PLANS_DATA.plan_id) append += '<button type="button" id="selected_plan_id' + value.plan_id + '" title="Click to update the plan details" class="btn bg-blue text-uppercase font-weight-bolder px-15 py-3" onclick="openPackagesPage()"> Upgrade </button>';
    else if(value.plan_id < GET_USER_PLANS_DATA.plan_id) append += '<button type="button" id="selected_plan_id' + value.plan_id + '" title="Click to update the plan details" class="btn bg-blue text-uppercase font-weight-bolder px-15 py-3" onclick="openPackagesPage()"> Downgrade </button>';
    append += '</div>' +
        '<div class="col-md-6 col-sm-12">' +
        '<p class="mb-15 d-flex flex-column">';
    if (value.plan_name === "Basic") append += '<span id="team_members_id">Team Member - ' + value.member_count + '</span>';
    else append += '<span id="team_members_id">Team Members - ' + value.member_count + '</span>';
    append += '<span>Social Networks - ' + socialNetworksFunction(value.available_network) + '</span>' +
        '<span>Total Profiles - <b>' + value.account_count + '</b></span>' +
        '<span>Browser extension - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>Scheduling & Posting - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>World Class 24*7 Training & Support - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>RSS Feed - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>Social Report - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>Discovery - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>Content Studio - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>Board Me - ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>Custom Report -  ' + planBoolenFunction(value.custom_report) + '</span>' +
        '<span>Maximum Referral Count - <b>' + value.maximum_referal_count + '</b></span>' +
        '<span>Maximum Schedule count - <b>' + value.maximum_schedule + '</b></span>' +
        '</p>' +
        '</div>';

    $('#selected_plan_Details_id').append(append);
    $('#selected_plan_id' + value.plan_id + '').tooltip();
}

function planBoolenFunction(data) {
    if (data === true) return '<b><i class="far fa-check-circle"></i></b>';
    else return '<b><i class="far fa-times-circle"></i></b>';
}

function socialNetworksFunction(socialData){
    let available_networks = [];
    let social_networks = "";
    available_networks = socialData.split("-");
    available_networks.forEach(function (id) {
        switch (id) {
            case "1":
                social_networks += '<i class="fab fa-facebook-f fa-fw" data-toggle="tooltip" data-placement="top" title="Facebook" data-original-title="Facebook"></i>';
                break;
            case "2":
                social_networks += '<i class="far fa-file fa-fw" data-toggle="tooltip" data-placement="top" title="Facebook page" data-original-title="Facebook page"></i>';
                break;
            case "3":
                social_networks += '<i class="fas fa-user-friends fa-fw" data-toggle="tooltip" data-placement="top" title="Facebook group" data-original-title="Facebook group"></i>';
                break;
            case "4":
                social_networks += '<i class="fab fa-twitter fa-fw" data-toggle="tooltip" data-placement="top" title="Twitter" data-original-title="Twitter"></i>';
                break;
            case "5":
                social_networks += '<i class="fab fa-instagram fa-fw" data-toggle="tooltip" data-placement="top" title="Instagram" data-original-title="Instagram"></i>';
                break;
            case "6":
                social_networks += '<i class="fab fa-linkedin-in fa-fw" data-toggle="tooltip" data-placement="top" title="Linkedin" data-original-title="Linkedin"></i>';
                break;
            case "7":
                social_networks += '<i class="fas fa-user-tie fa-fw" data-toggle="tooltip" data-placement="top" title="linkedin Business" data-original-title="linkedin Business"></i>';
                break;
            case "8":
                social_networks += '<i class="fab fa-google-plus-g fa-fw" data-toggle="tooltip" data-placement="top" title="Google Plus" data-original-title="Google Plus"></i>';
                break;
            case "9":
                social_networks += '<i class="fab fa-youtube fa-fw" data-toggle="tooltip" data-placement="top" title="YouTube" data-original-title="YouTube"></i>';
                break;
            case "10":
                social_networks += '<i class="fas fa-chart-line fa-fw" data-toggle="tooltip" data-placement="top" title="Google Analytics" data-original-title="Google Analytics"></i>';
                break;
            case "11":
                social_networks += '<i class="fab fa-dailymotion fa-fw" data-toggle="tooltip" data-placement="top" title="Dailymotion" data-original-title="Dailymotion"></i>';
                break;
        }
    })
  return social_networks;
}

function openPackagesPage() {
    window.location.href = "https://appv5.socioboard.com/amember/member"
}
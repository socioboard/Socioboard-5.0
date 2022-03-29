
<div class="col-xl-4" style="top: 50px;">
    <div class="card card-custom gutter-b sticky " data-sticky="true" data-margin-top="220px" data-sticky-for="1023" style="position: fixed; width: 606px; left: 26px;">
        <div class="card-header border-0 py-5">
            <h3 class="card-title font-weight-bolder">{{$title}}</h3>
        </div>
        <!--begin::Body-->
        <div class="card-body">
            <!--begin::Form-->
            <form id="search" action="{{url('discovery/content_studio/'.strtolower($title).'/search')}}" method="get">
                <input type="hidden" name="pageId" id="pageId" value="1">
                <!--begin::Social-->
                <div class="form-group">
                    <div class="input-icon">
                        <label for="keyword" style="display: none"></label>
                        <div id="InKwyword">
                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" id="keyword" name="keyword" value="@if(isset($_GET['keyword'])){{ $_GET['keyword'] }}@endif" autocomplete="off" placeholder="Enter Keyword">
                            <span><i class="far fa-keyboard"></i></span>
                        </div>
                    </div>
                    <span  id="error-keyword" class="error-message" style="color: red"></span>
                </div>

                @if(isset($type))
                    <div class="form-group">
                        <label for="type" style="display: none"></label>
                        <select name="type" id="type" class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6">
                            <option disabled="">Filter</option>
                            @php $i = 0; @endphp
                            @foreach($type as $key => $value)
                                <option value="{{$key}}" @if(isset($_GET['type']) && $_GET['type'] == $key){{ 'selected' }}@endif @if($i == 0) {{'selected="selected"'}} @endif>{{$value}}</option>
                                @php $i++ @endphp
                            @endforeach
                        </select>
                        <span id="error-type" class="error-message" style="color: red"></span>
                    </div>
                @endif
                @if(isset($rating))
                    <div class="form-group">
                        <label for="sortBy" style="display: none"></label>
                        <select id="sortBy" name="rating" class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 ratingCLass">
                            <option disabled="">Sort by</option>
                            @php $i = 0; @endphp
                            @foreach($rating as $key => $value)
                                <option value="{{$key}}" @if(isset($_GET['rating']) && $_GET['rating'] == $key){{ 'selected' }}@endif @if($i == 0) {{'selected="selected"'}} @endif>{{$value}}</option>
                                @php $i++ @endphp
                            @endforeach
                        </select>
                        <span id="error-rating" class="error-message" style="color: red"></span>
                    </div>
            @endif
            <!--end::Social-->
                <button type="reset" class="btn font-weight-bolder mr-2 px-8" onclick="clearFunction()">Clear</button>
                <button id="searchBtn" class="btn font-weight-bolder px-8" data-loading-text="<i class='fa fa-spinner fa-spin '></i> Processing Order">Search</button>
            </form>
            <!--end::Form-->
        </div>
        <!--end::Body-->
    </div>
</div>
<script>
    function clearFunction() {
        $("#InKwyword").empty().append('<input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="keyword" id="keyword" placeholder="Enter Keyword"/>\n' +
            '                                            <span><i class="far fa-keyboard"></i></span>');
    }
</script>
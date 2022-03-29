@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Discovery</title>
@endsection
@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Row-->
                <h4 class="text-center mb-5">Articles</h4>
                <div class="row">
                    <div class="col-md-6">
                        <div class="rss-feed-articles">
                        <div class="card rss-feed-articlesDiv">
                            <div class="card-body">
                                <h5 class="text-center mb-5">Added Newspapers</h5>
                                <div class="rss-tags">
                                    @if(isset($channels) && sizeof($channels['data']) > 0)
                                        @foreach($channels['data'] as $data)
                                    <button id="showKeywordButton" type="button" class="btn newsPaperButton" onclick="showkeywords('{{$data->id}}')">{{$data->title}}</button>
                                        @endforeach
                                        @endif
                                </div>
                            </div>
                        </div>
                        <div class="card mt-7 keywordDiv">
                            <div class="card-body">
                                <div>
                                <h5 class="text-center mb-5">Keywords</h5>
                                    <div id="spinnig" style="text-align: center"> Please Select Newspapers to get Keywords.</div>
                                <div class="rss-tags" id="keywordsss">
                                </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <div class="col-md-6 rss-feeds-wrapper" id="rss_news">
                        <div class="card mt-7">
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-12" id="loader_news" style="text-align: center">
                                        <h5 class="mt-0 mb-0" style="text-align: center"> <span class="" ></span>Please select keywords to get RSS feeds. </h5>
                                        <p class="mt-3" > </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <!--end::Row-->
                <!--end::Profile-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
@endsection

@section('scripts')
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
@endsection

@section('page-scripts')

    <script>
        $(document).ready(function () {
            $("#boards").trigger('click');
            $("#discovery").trigger('click');
        });

        function showkeywords(id) {
            $('#keywordsss').empty();
            $('#spinnig').empty().append('<i class="fa fa-spinner fa-spin"></i> Loading');
            $.ajax({
                url: "/discovery/get-keywords/"+id,
                type: "get",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    $('#spinnig').empty();
                    if (response['code'] === 200) {
                        let keywords = "";
                        response.data.links.map(element => {
                        let url = "'"+element.url+"'";
                        keywords+=('<a type="button" class="btn" title="'+element.url+'" onclick="getDetails('+url+')">'+element.category+'</a>');
                        })
                        $('#keywordsss').empty().append(keywords);
                    } else if (response['code'] === 400) {
                        toastr.error(response.error);
                    } else if(response.code === 500) {
                        toastr.error(response.error);
                    }else {
                        toastr.error("Something went wrong! Please reload the page");
                    }
                },
                error: function (error) {
                    toastr.error(error.ErrorMessage);
                }
            })
        }

        function getDetails(url) {
            $('#loader_news').empty().append('<i class="fa fa-spinner fa-spin"></i>Loading');
            $.ajax({
                url: "/discovery/rss-feeds-by-link",
                type: "get",
                data: {
                    url : url
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                beforeSend: function () {
                    $('#rss_news').empty().append('<div class="card mt-7">\n' +
                        '                            <div class="card-body">\n' +
                        '                                <div class="row">\n' +
                        '                                    <div class="col-md-12" id="loader_news" style="text-align: center"><i class="fa fa-spinner fa-spin"> </i> Loading\n' +
                        '                                        <p class="mt-3" > </p>\n' +
                        '                                    </div>\n' +
                        '                                </div>\n' +
                        '                            </div>\n' +
                        '                        </div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    if (response['code'] === 200) {
                        let datss = "";
                        response.data.map(element => {
                            datss += '<div class="card mt-7">\n' +
                                '                            <div class="card-body">\n' +
                                '                                <div class="row">\n' +
                                '                                    <div class="col-md-11"  style="text-align: center">\n' +
                                ' <a href="'+element.mediaUrl+'" class="font-weight-bolder font-size-h6">'+element.title+' </a>' +
                                '                                        <p class="mt-3" >'+element.description+' </p>\n' +
                                '                                    </div>\n' +
                                '                                </div>\n' +
                                '                            </div>\n' +
                                '                        </div>'
                        })
                        $('#rss_news').empty().append(datss);
                    } else if (response['code'] === 400) {
                        toastr.error(response.error);
                    } else if(response.code === 500) {
                        toastr.error(response.error);
                    }else {
                        toastr.error(response.error);
                    }
                },
                error: function (error) {
                    toastr.error(error.ErrorMessage);
                }
            })
        }
    </script>
@endsection



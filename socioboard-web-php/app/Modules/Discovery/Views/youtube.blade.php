@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Discovery Youtube</title>
@endsection

@section('style')
    <style type="text/css">
        .keyword_font {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 0;
            color: #14171a;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Ubuntu, "Helvetica Neue", sans-serif;
        }

        .trending_text {
            margin-bottom: 0;
            color: #616c77;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif;
        }

        .trending_img_post {
            display: flex;
            flex-wrap: nowrap;
        }
    </style>
@endsection


@section('youtubeDiscovery')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>YouTube</h4>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="card bg-light border-0 shadow">
                <div class="card-body">
                    <form class="form-inline mb-2" id="youtubeForm">
                        <div class="form-group col-4">
                            <label for="youtube_search">Keyword</label>
                            <input type="text" class="form-control col-12 border-0 rounded-pill" id="youtube_search" name="keyword"
                                   placeholder="keyword" value="{{env('YOUTUBE_TRENDS_KEYWORD')}}">
                        </div>
                        <div class="form-group col-3">
                            <label for="sort_by">Sort by</label>
                            <select class="form-control col-12" id="sort_by">
                                <option value="date">date</option>
                                <option value="rating">rating</option>
                                <option value="relevance">relevance</option>
                                <option value="title">title</option>
                                <option value="viewCount">viewCount</option>
                            </select>
                        </div>
                        <div class="text-center col-2">
                            <button type="submit" class="btn btn-primary col-12 rounded-pill">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <div class="card-columns mt-5" id="youtube">



    </div>
    <div class="d-flex justify-content-center" >
        <div class="spinner-border" role="status"  id="bootLoader" style="display: none;">
            <span class="sr-only">Loading...</span>
        </div>
    </div>


    @include('Discovery::incPostModal')
@endsection


@section('script')
    <script>
        //for GA
        var eventCategory = 'Content-Studio';
        var eventAction = 'Youtube';
    </script>

  @include("Discovery::incYoutubepostJs")
  @include("Discovery::incYoutubeGetDataScript")

@endsection
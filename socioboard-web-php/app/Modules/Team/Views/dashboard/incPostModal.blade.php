<!-- post modal -->
<div class="modal fade" id="incpostModal" tabindex="-1" role="dialog" aria-labelledby="postModalLabel"
     aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header p-1 bg-light">
                <h5 class="modal-title">Create post</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body p-2">
                <form id="publishForm">
                {{--<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">--}}
                {{--<ol class="carousel-indicators">--}}
                {{--<li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>--}}
                {{--<li data-target="#carouselExampleIndicators" data-slide-to="1"></li>--}}
                {{--<li data-target="#carouselExampleIndicators" data-slide-to="2"></li>--}}
                {{--</ol>--}}
                {{--<div class="carousel-inner" style="height: 200px;">--}}
                {{--<div class="carousel-item active">--}}
                {{--<img src="//i.imgur.com/TkgPTzV.png" class="d-block w-100" alt="...">--}}
                {{--</div>--}}
                {{--<div class="carousel-item">--}}
                {{--<div class="video_imgur">--}}
                {{--<video poster="//i.imgur.com/4zzdRB3h.jpg" muted="muted" autoplay="autoplay"--}}
                {{--loop="loop" class="video_width_full">--}}
                {{--<source src="https://i.imgur.com/MHybvto_lq.mp4" type="video/mp4">--}}
                {{--</video>--}}
                {{--</div>--}}
                {{--</div>--}}
                {{--</div>--}}
                {{--<a class="carousel-control-prev" href="#carouselExampleIndicators" role="button"--}}
                {{--data-slide="prev">--}}
                {{--<span class="carousel-control-prev-icon" aria-hidden="true"></span>--}}
                {{--<span class="sr-only">Previous</span>--}}
                {{--</a>--}}
                {{--<a class="carousel-control-next" href="#carouselExampleIndicators" role="button"--}}
                {{--data-slide="next">--}}
                {{--<span class="carousel-control-next-icon" aria-hidden="true"></span>--}}
                {{--<span class="sr-only">Next</span>--}}
                {{--</a>--}}
                {{--</div>--}}
                <!-- post input box -->
                    <div class="form-group">
                                <textarea name="message" class="form-control border border-light" id="normal_post_area" rows="3"
                                          placeholder="Write something !" ></textarea>


                        <p id="messageError" style="color: red" ></p>
                    </div>
                    <!-- image and video upload -->
                    <div class="row">
                        <div class="col-12" id="option_upload" style="display: none">
                            <ul class="btn-nav">
                                <li>
                                            <span>
                                                <i class="far fa-image text-secondary"></i>
                                                <input type="file" name="" click-type="type1" class="picupload" multiple
                                                       accept="image/*" />
                                            </span>
                                </li>
                                <li>
                                            <span>
                                                <i class="fas fa-video text-secondary"></i>
                                                <input type="file" name="" click-type="type1" class="picupload" multiple
                                                       accept="video/*" />
                                            </span>
                                </li>
                            </ul>
                        </div>


                        <div class="col-12">
                            <ul id="media-list">

                            </ul>
                        </div>

                        <div class="col-12" id="hint_brand" style="display: none;">
                            <ul id="media-list" class="clearfix">
                                <li class="myupload">
                                            <span>
                                                <i class="fa fa-plus" aria-hidden="true"></i>
                                                <input type="file" click-type="type2" id="picupload" class="picupload"
                                                       multiple>
                                            </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <!-- end of image and video upload -->
                    <hr>
                    <!-- user or pages add list -->
                    <div class="row">
                        <div class="col-md-12">
                            <button type="button" class="btn btn-fb btn-sm all_social_btn">Add Accounts</button>
                            <div class="all_social_div">
                                <div>
                                    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link active" id="pills-facebook-profile-tab"
                                               data-toggle="pill" href="#pills-facebook-profile" role="tab"
                                               aria-controls="pills-facebook-profile" aria-selected="true"><i
                                                    class="fab fa-facebook-f"></i></a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link " id="pills-twitter-profile-tab"
                                               data-toggle="pill" href="#pills-twitter-profile" role="tab"
                                               aria-controls="pills-twitter-profile" aria-selected="false"><i
                                                    class="fab fa-twitter"></i></a>
                                        </li>
                                        {{--<li class="nav-item">--}}
                                        {{--<a class="nav-link" id="pills-linkedin-profile-tab"--}}
                                        {{--data-toggle="pill" href="#pills-linkedin-profile" role="tab"--}}
                                        {{--aria-controls="pills-linkedin-profile" aria-selected="false"><i--}}
                                        {{--class="fab fa-linkedin-in"></i></a>--}}
                                        {{--</li>--}}
                                        {{--<li class="nav-item">--}}
                                        {{--<a class="nav-link" id="pills-pinterest-profile-tab"--}}
                                        {{--data-toggle="pill" href="#pills-pinterest-profile" role="tab"--}}
                                        {{--aria-controls="pills-pinterest-profile" aria-selected="false"><i--}}
                                        {{--class="fab fa-pinterest-p"></i></a>--}}
                                        {{--</li>--}}
                                    </ul>
                                    <div class="tab-content" id="pills-tabContent">
                                        <div class="tab-pane fade show active" id="pills-facebook-profile"
                                             role="tabpanel" aria-labelledby="pills-facebook-profile-tab">
                                            <div class="card margin-top-10">
                                                <div class="card-body bg-white p-2">
                                                    <h6><b>Choose Facebook Pages To Connect</b></h6>
                                                    <div>
                                                        <ul class="list-group">
                                                            @for($i=0;$i<count($socialAccount);$i++)
                                                                @if( $socialAccount[$i]->account_type == env('FACEBOOKPAGE'))
                                                                    @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
                                                                        <li class="list-group-item page_list">
                                                                            <div class="media">
                                                                                <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                                <div class="media-body">
																				<span  class="float-right badge badge-light" id="checkboxes">
																					<div class="custom-control custom-checkbox">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->social_id}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                    <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                    <b   style="font-size: 12px;">Follower:</b>
                                                                                    {{$socialAccount[$i]->friendship_counts}}

                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    @endif
                                                                @endif
                                                            @endfor

                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-twitter-profile" role="tabpanel"
                                             aria-labelledby="pills-twitter-profile-tab">
                                            <div class="card margin-top-10">
                                                <div class="card-body bg-white p-2">
                                                    <h6><b>Choose Twitter profile for posting</b></h6>
                                                    <div>
                                                        <ul class="list-group">
                                                            @for($i=0;$i<count($socialAccount);$i++)
                                                                @if($socialAccount[$i]->account_type == env('TWITTER') )
                                                                    @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
                                                                        <li class="list-group-item page_list">
                                                                            <div class="media">
                                                                                <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                                <div class="media-body">
																				<span  class="float-right badge badge-light">
																					<div class="custom-control custom-checkbox" id="checkboxes">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->social_id}}""><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                    <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                    <b   style="font-size: 12px;">Follower:</b>
                                                                                    {{$socialAccount[$i]->friendship_counts}}

                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    @endif
                                                                @endif
                                                            @endfor
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tab-pane fade" id="pills-linkedin-profile" role="tabpanel"
                                             aria-labelledby="pills-linkedin-profile-tab">
                                            <div class="card margin-top-10">
                                                <div class="card-body bg-white p-2">
                                                    <h6><b>Choose Linkedin Profile and Pages for posting</b>
                                                    </h6>
                                                    <div>
                                                        <ul class="list-group">
                                                            @for($i=0;$i<count($socialAccount);$i++)
                                                                @if($socialAccount[$i]->account_type == env('LINKEDIN') || $socialAccount[$i]->account_type == env('LINKEDINCOMPANY'))
                                                                    {{--should give a condition for lock--}}
                                                                    <li class="list-group-item page_list">
                                                                        <div claFss="media">
                                                                            <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                            <div class="media-body">
																				<span  class="float-right badge badge-light">
																					<div class="custom-control custom-checkbox" id="checkboxes">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->social_id}}""><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                <b   style="font-size: 12px;">Follower:</b>
                                                                                {{$socialAccount[$i]->friendship_counts}}

                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                @endif
                                                            @endfor
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {{--<div class="tab-pane fade" id="pills-pinterest-profile" role="tabpanel"--}}
                                        {{--aria-labelledby="pills-pinterest-profile-tab">--}}
                                        {{--<div class="card margin-top-10">--}}
                                        {{--<div class="card-body bg-white p-2">--}}
                                        {{--<h6><b>Choose Pinterest Profile for posting</b></h6>--}}
                                        {{--<div class="accordion" id="accordionExample">--}}
                                        {{--<div class="card border-0">--}}
                                        {{--<div class="card-header bg-danger text-white p-1 m-0"--}}
                                        {{--id="headingOne" style="cursor: pointer;">--}}
                                        {{--<div data-toggle="collapse"--}}
                                        {{--data-target="#profile_pin_1"--}}
                                        {{--aria-expanded="true"--}}
                                        {{--aria-controls="profile_pin_1">--}}
                                        {{--<div class="media">--}}
                                        {{--<img src="../assets/imgs/bydefault.png"--}}
                                        {{--class="mr-3 pp_50 rounded-circle"--}}
                                        {{--alt="avatar">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<h5 class="mt-0 mb-0">Chanchal</h5>--}}
                                        {{--<span>2</span> boards--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--<div id="profile_pin_1" class="collapse show"--}}
                                        {{--aria-labelledby="headingOne"--}}
                                        {{--data-parent="#accordionExample">--}}
                                        {{--<div class="card-body p-2">--}}
                                        {{--<ul class="list-group">--}}
                                        {{--<li class="list-group-item page_list">--}}
                                        {{--<div class="media">--}}
                                        {{--<img class="mr-3 pp_50 rounded-circle"--}}
                                        {{--src="../assets/imgs/64x64.jpg"--}}
                                        {{--alt="page title">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<span--}}
                                        {{--class="float-right badge badge-light">--}}
                                        {{--<div--}}
                                        {{--class="custom-control custom-checkbox">--}}
                                        {{--<input--}}
                                        {{--type="checkbox"--}}
                                        {{--class="custom-control-input"--}}
                                        {{--id="pin_board_1">--}}
                                        {{--<label--}}
                                        {{--class="custom-control-label"--}}
                                        {{--for="pin_board_1"><span--}}
                                        {{--style="display: flex; margin-top: 6px;">Add</span></label>--}}
                                        {{--</div>--}}
                                        {{--</span>--}}
                                        {{--<h5--}}
                                        {{--class="mt-2 mb-0 page_name">--}}
                                        {{--board name one</h5>--}}
                                        {{--<b--}}
                                        {{--style="font-size: 12px;">pin:</b>--}}
                                        {{--14--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</li>--}}
                                        {{--<li class="list-group-item page_list">--}}
                                        {{--<div class="media">--}}
                                        {{--<img class="mr-3 pp_50 rounded-circle"--}}
                                        {{--src="../assets/imgs/64x64.jpg"--}}
                                        {{--alt="page title">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<span--}}
                                        {{--class="float-right badge badge-light">--}}
                                        {{--<div--}}
                                        {{--class="custom-control custom-checkbox">--}}
                                        {{--<input--}}
                                        {{--type="checkbox"--}}
                                        {{--class="custom-control-input"--}}
                                        {{--id="pin_board_2">--}}
                                        {{--<label--}}
                                        {{--class="custom-control-label"--}}
                                        {{--for="pin_board_2"><span--}}
                                        {{--style="display: flex; margin-top: 6px;">Add</span></label>--}}
                                        {{--</div>--}}
                                        {{--</span>--}}
                                        {{--<h5--}}
                                        {{--class="mt-2 mb-0 page_name">--}}
                                        {{--board name one</h5>--}}
                                        {{--<b--}}
                                        {{--style="font-size: 12px;">pin:</b>--}}
                                        {{--14--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</li>--}}
                                        {{--<li class="list-group-item page_list">--}}
                                        {{--<div class="media">--}}
                                        {{--<img class="mr-3 pp_50 rounded-circle"--}}
                                        {{--src="../assets/imgs/64x64.jpg"--}}
                                        {{--alt="page title">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<span--}}
                                        {{--class="float-right badge badge-light">--}}
                                        {{--<div--}}
                                        {{--class="custom-control custom-checkbox">--}}
                                        {{--<input--}}
                                        {{--type="checkbox"--}}
                                        {{--class="custom-control-input"--}}
                                        {{--id="pin_board_3">--}}
                                        {{--<label--}}
                                        {{--class="custom-control-label"--}}
                                        {{--for="pin_board_3"><span--}}
                                        {{--style="display: flex; margin-top: 6px;">Add</span></label>--}}
                                        {{--</div>--}}
                                        {{--</span>--}}
                                        {{--<h5--}}
                                        {{--class="mt-2 mb-0 page_name">--}}
                                        {{--board name one</h5>--}}
                                        {{--<b--}}
                                        {{--style="font-size: 12px;">pin:</b>--}}
                                        {{--14--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</li>--}}
                                        {{--</ul>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--<div class="card border-0">--}}
                                        {{--<div class="card-header bg-danger text-white p-1 m-0"--}}
                                        {{--id="headingTwo" style="cursor: pointer;">--}}
                                        {{--<div data-toggle="collapse"--}}
                                        {{--data-target="#profile_pin_2"--}}
                                        {{--aria-expanded="true"--}}
                                        {{--aria-controls="profile_pin_2">--}}
                                        {{--<div class="media">--}}
                                        {{--<img src="../assets/imgs/bydefault.png"--}}
                                        {{--class="mr-3 pp_50 rounded-circle"--}}
                                        {{--alt="avatar">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<h5 class="mt-0 mb-0">Socioboard--}}
                                        {{--</h5>--}}
                                        {{--<span>3</span> boards--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--<div id="profile_pin_2" class="collapse"--}}
                                        {{--aria-labelledby="headingTwo"--}}
                                        {{--data-parent="#accordionExample">--}}
                                        {{--<div class="card-body p-2">--}}
                                        {{--<ul class="list-group">--}}
                                        {{--<li class="list-group-item page_list">--}}
                                        {{--<div class="media">--}}
                                        {{--<img class="mr-3 pp_50 rounded-circle"--}}
                                        {{--src="../assets/imgs/64x64.jpg"--}}
                                        {{--alt="page title">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<span--}}
                                        {{--class="float-right badge badge-light">--}}
                                        {{--<div--}}
                                        {{--class="custom-control custom-checkbox">--}}
                                        {{--<input--}}
                                        {{--type="checkbox"--}}
                                        {{--class="custom-control-input"--}}
                                        {{--id="pin_board_21">--}}
                                        {{--<label--}}
                                        {{--class="custom-control-label"--}}
                                        {{--for="pin_board_21"><span--}}
                                        {{--style="display: flex; margin-top: 6px;">Add</span></label>--}}
                                        {{--</div>--}}
                                        {{--</span>--}}
                                        {{--<h5--}}
                                        {{--class="mt-2 mb-0 page_name">--}}
                                        {{--board name one</h5>--}}
                                        {{--<b--}}
                                        {{--style="font-size: 12px;">pin:</b>--}}
                                        {{--14--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</li>--}}
                                        {{--<li class="list-group-item page_list">--}}
                                        {{--<div class="media">--}}
                                        {{--<img class="mr-3 pp_50 rounded-circle"--}}
                                        {{--src="../assets/imgs/64x64.jpg"--}}
                                        {{--alt="page title">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<span--}}
                                        {{--class="float-right badge badge-light">--}}
                                        {{--<div--}}
                                        {{--class="custom-control custom-checkbox">--}}
                                        {{--<input--}}
                                        {{--type="checkbox"--}}
                                        {{--class="custom-control-input"--}}
                                        {{--id="pin_board_22">--}}
                                        {{--<label--}}
                                        {{--class="custom-control-label"--}}
                                        {{--for="pin_board_22"><span--}}
                                        {{--style="display: flex; margin-top: 6px;">Add</span></label>--}}
                                        {{--</div>--}}
                                        {{--</span>--}}
                                        {{--<h5--}}
                                        {{--class="mt-2 mb-0 page_name">--}}
                                        {{--board name one</h5>--}}
                                        {{--<b--}}
                                        {{--style="font-size: 12px;">pin:</b>--}}
                                        {{--14--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</li>--}}
                                        {{--<li class="list-group-item page_list">--}}
                                        {{--<div class="media">--}}
                                        {{--<img class="mr-3 pp_50 rounded-circle"--}}
                                        {{--src="../assets/imgs/64x64.jpg"--}}
                                        {{--alt="page title">--}}
                                        {{--<div class="media-body">--}}
                                        {{--<span--}}
                                        {{--class="float-right badge badge-light">--}}
                                        {{--<div--}}
                                        {{--class="custom-control custom-checkbox">--}}
                                        {{--<input--}}
                                        {{--type="checkbox"--}}
                                        {{--class="custom-control-input"--}}
                                        {{--id="pin_board_23">--}}
                                        {{--<label--}}
                                        {{--class="custom-control-label"--}}
                                        {{--for="pin_board_23"><span--}}
                                        {{--style="display: flex; margin-top: 6px;">Add</span></label>--}}
                                        {{--</div>--}}
                                        {{--</span>--}}
                                        {{--<h5--}}
                                        {{--class="mt-2 mb-0 page_name">--}}
                                        {{--board name one</h5>--}}
                                        {{--<b--}}
                                        {{--style="font-size: 12px;">pin:</b>--}}
                                        {{--14--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</li>--}}
                                        {{--</ul>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                        {{--</div>--}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <input style="display: none" id="link" name="rsslink"  />
                    <div class="float-right">
                        {{--<button type="button" onclick="post(0)" class="btn btn-secondary"><i id="draftspinstyle" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="draftspin">Draft</span></button>--}}
                        <button type="button" onclick="post(1)" class="btn btn-primary remember"><i id="test" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="testText">Post</span></button>
                    </div>

                </form>
            </div>
            {{--<div class="modal-footer">--}}
            {{--<button type="button" class="btn btn-secondary" data-dismiss="modal">Draft</button>--}}
            {{--<button type="button" class="btn btn-primary">Send</button>--}}
            {{--</div>--}}

        </div>
    </div>
</div>

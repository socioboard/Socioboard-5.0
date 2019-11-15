{{-- print_r($userProfile --}}
{{--print_r($boards) --}}
<div
        class="modal fade"
        id="createPinBoardModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="createBoardModalLabel"
        aria-hidden="true"
        >
    <div class="modal-dialog  modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create New Board</h5>
                <button
                        type="button"
                        class="close"
                        data-dismiss="modal"
                        aria-label="Close"
                        >
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <form id="boardCreate">
                    <p type="text" class="form-control" id="accId" name="accId"  style="display: none"/>

                    <div class="form-group">
                        <label for="boardname">Board Name</label>
                        <input type="text" class="form-control" id="boardname" name="boardName" placeholder="Enter Board Name"/>
                    </div>
                    <div class="form-group">
                        <label for="boar">Board Description</label>
                        <input type="text" class="form-control" id="decsription" name="boardDescription" placeholder="Board Description"/>
                    </div> <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">
                            Close
                        </button>
                        <button type="button" class="btn btn-primary" id="pinCreate">Create</button>
                    </div>
                </form>
            </div>

        </div>
    </div>
</div>
<div class="shadow mb-5 bg-white pin-card rounded">
    <p id="accountID" type="hidden" style="display: none;">{{$userProfile->account_id }}</p>
    <div class="card-body">

        <span class="card_social_ribbon">
            <i class="fab fa-pinterest-p"></i>
        </span>

        <div class="text-center">
            <img class="rounded-circle card-avatar" src="{{ $userProfile->profile_pic_url }}" alt="{{$userProfile->first_name}} {{$userProfile->last_name}}"/>
            <h5 class="card-title no-space">{{$userProfile->first_name}} {{$userProfile->last_name}}</h5>
            <p class="card-text">{{ @$userProfile->bio_text }}</p>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="text-center">
                    <h5>{{ (integer)@$userProfile->follower_count }}</h5>
                    <h6>Follower</h6>
                </div>
            </div>
            <div class="col-md-6">
                <div class="text-center">
                    <h5>{{ (integer)@sizeof($boards) }}</h5>
                    <h6>Boards</h6>
                </div>
            </div>
        </div>

    </div>

{{--    commented temporarily--}}
{{--    <div class="card-footer bg-transparent">--}}
{{--        <a href="#" class="btn btn-primary col-md-12">View Reports</a>--}}
{{--    </div>--}}
</div>

<div>
    <span>Board List</span>
    {{--<a href="pin_boards.html" class="text-dark float-right">view all</a> --}}
</div>

<div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">

    @foreach($boards as $board)
    <a class="nav-link nav-board @if ( $board->board_id == $board_id ) active @endif"
       id="v-pills-boardone-tab-{{$board->id}}"
       data-boardId="{{ $board->board_id }}"
       data-accountId="{{ $account_id }}"
       data-toggle="pill" href="#v-pills-boardone" role="tab" aria-controls="v-pills-boardone"
       aria-selected=@if ($loop->index==0) "true" @else "false" @endif >{{ $board->board_name }}</a>

    @endforeach

    {{--
    <a class="nav-link" id="v-pills-profile-tab" data-toggle="pill" href="#v-pills-profile" role="tab" aria-controls="v-pills-profile" aria-selected="false">Profile</a>
    --}}

</div>
{{--commented temporarily--}}
{{--<a class="btn btn-sm btn-primary float-left open-createPinBoardModal" href="#" data-toggle="modal" data-target="#createPinBoardModal"> Create Pinterest Board</a>--}}

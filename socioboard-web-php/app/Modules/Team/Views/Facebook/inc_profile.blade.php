<div class="mb-3 bg-white fb-card rounded">

    <div class="card-body">
                <span class="card_social_ribbon">
                  <i class="fab fa-facebook-f"></i>
                </span>

        <div class="text-center">
            <img class="rounded-circle" src="https://graph.facebook.com/{{$userProfile->social_id}}/picture?type=large"
                 alt="{{$userProfile->first_name}} {{$userProfile->last_name}}"/>
            <h5 class="card-title no-space">{{$userProfile->first_name}} {{$userProfile->last_name}}</h5>
            <p class="card-text">{{$userProfile->email}}</p>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="text-center">
                    <h5>***</h5>
                    <h6>Followers</h6>
                </div>
            </div>
            <div class="col-md-6">
                <div class="text-center">
                    <h5>{{$userProfile->friendship_counts}}</h5>
                    <h6>Friends</h6>
                </div>
            </div>
        </div>
    </div>
    <div class="card-footer bg-transparent">
        @if(session()->get('user')['userDetails']->userPlanDetails->social_report == 1)
        <a href="{{env('APP_URL')}}report/{{$userProfile->account_id}}/{{$userProfile->account_type}}" class="btn btn-outline-dark col-md-12 margin-top-10">View Reports</a>
        @else
            <a href="#" class="btn btn-outline-dark col-md-12 margin-top-10" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->social_report}})">View Reports</a>
        @endif
    </div>
</div>
@if ( null !== $socioboard_accounts)
    <div class="row m-0">
        <span class="col-12 p-0 text-dark font-weight-bold">SocioBoard Facebook accounts</span>

        @foreach($socioboard_accounts->facebook as $account)
            <a href="{{route('socialNetworkDashboard', ['socialNetwork' => 'facebook', 'account_id' => $account->account_id])}}"
               class="col-6 col-md-4 col-sm-6 col-xs-6 p-0">
                <div class="card-body bg-white p-1">
                    <img src="{{$account->profile_pic_url}}" style="max-width: 70px;" />
                    <div class="frnd_card">
                        <span class="frnd_name">{{$account->first_name}} {{$account->last_name}}</span>
                    </div>
                </div>
            </a>
        @endforeach
    </div>
@endif
{{--Changed by Aishwarya in order to check plan--}}
@include('User::dashboard.incPlanChangeJs')
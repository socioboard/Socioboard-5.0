@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Price</title>
@endsection
<script>
    //for GA
    var eventCategory = 'User';
    var eventAction = 'Price-Table';
</script>

@section('price')
    <div class="container margin-top-60">
        <h2 class="" style="color: #183b56; line-height: 1.2; font-weight: 600;">Price Table</h2>
        <div class="row">
            <div class="col-md-12">
                <table class="table table-borderless table-dark table-striped shadow-lg rounded">
                    <thead>
                    <tr>
                        <th scope="col">&nbsp;</th>
{{--                        <th scope="col" class="text-center">Beta--}}
{{--                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 0)--}}
{{--                                <button  class="btn btn-sm btn-primary plan" disabled>Current</button>--}}
{{--                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 0)--}}
{{--                                <button  class="btn btn-sm btn-primary plan" id="{{env('BETA')}}" disabled>Downgrade</button>--}}
{{--                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 0)--}}
{{--                                <button  class="btn btn-sm btn-primary plan" id="{{env('BETA')}}" data-toggle="modal" data-target="#paymentModal" disabled>Upgrade</button>--}}
{{--                            @endif--}}

{{--                        </th>--}}
                        <th scope="col" class="text-center">Basic Plan
                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 0)
                                <button  class="btn btn-sm btn-primary plan">Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 0)
                                <button  class="btn btn-sm btn-primary plan" id="{{env('BASIC')}}">Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 0)
                                <button  class="btn btn-sm btn-primary plan" id="{{env('BASIC')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif

                        </th>
                        <th scope="col" class="text-center">Standard

                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 1)
                                <button  class="btn btn-primary btn-sm plan" >Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 1)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('STANDARD')}}" >Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 1)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('STANDARD')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif

                            {{--<button class="btn btn-sm btn-primary" data-toggle="modal"--}}
                                    {{--data-target="#paymentModal">Upgrade</button>--}}
                        </th>
                        <th scope="col" class="text-center">Premium
                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 2)
                                <button  class="btn btn-primary btn-sm plan" data-target="#paymentModal"  >Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 2)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('PREMIUM')}}" data-toggle="modal" data-target="#paymentModal" >Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 2)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('PREMIUM')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif
                        </th>
                        <th scope="col" class="text-center">Deluxe
                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 3)
                                <button  class="btn btn-primary btn-sm plan" >Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 3)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('DELUXE')}}" data-toggle="modal" data-target="#paymentModal" >Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 3)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('DELUXE')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif
                        </th>
                        <th scope="col" class="text-center">Topaz
                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 4)
                                <button  class="btn btn-primary btn-sm plan" >Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 4)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('TOPAZ')}}" data-toggle="modal" data-target="#paymentModal" >Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 4)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('TOPAZ')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif
                        </th>
                        <th scope="col" class="text-center">Ruby
                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 5)
                                <button  class="btn btn-primary btn-sm plan" >Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 5)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('RUBY')}}" data-toggle="modal" data-target="#paymentModal" >Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 5)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('RUBY')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif
                        </th>
                        <th scope="col" class="text-center">Gold
                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 6)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('GOLD')}}" >Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 6)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('GOLD')}}" data-toggle="modal" data-target="#paymentModal" >Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 6)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('GOLD')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif
                        </th>
                        <th scope="col" class="text-center">Platinum
                            @if(Session()->get('user')['userDetails']->Activations->user_plan == 7)
                                <button  class="btn btn-primary btn-sm plan" >Current</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 7)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('PLATINUM')}}" data-toggle="modal" data-target="#paymentModal" >Downgrade</button>
                            @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 7)
                                <button  class="btn btn-primary btn-sm plan" id="{{env('PLATINUM')}}" data-toggle="modal" data-target="#paymentModal" >Upgrade</button>
                            @endif
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <th scope="row">Monthly price</th>
{{--                        <td class="text-center">Free</td>--}}
                        <td class="text-center">Free</td>
                        <td class="text-center">$4.99</td>
                        <td class="text-center">$9.993</td>
                        <td class="text-center">$19.99</td>
                        <td class="text-center">$29.99</td>
                        <td class="text-center">$49.99</td>
                        <td class="text-center">$79.99</td>
                        <td class="text-center">$99.99</td>
                    </tr>
                    <tr>
                        <th scope="row">Social Accounts</th>
{{--                        <td class="text-center">No limit per network</td>--}}
                        <td class="text-center">1 per network</td>
                        <td class="text-center">No limit per network</td>
                        <td class="text-center">No limit per network</td>
                        <td class="text-center">No limit per network</td>
                        <td class="text-center">No limit per network</td>
                        <td class="text-center">No limit per network</td>
                        <td class="text-center">No limit per network</td>
                        <td class="text-center">No limit per network</td>
                    </tr>
                    <tr>
                        <th scope="row">Team Members</th>
{{--                        <td class="text-center">5</td>--}}
                        <td class="text-center">2</td>
                        <td class="text-center">5</td>
                        <td class="text-center">10</td>
                        <td class="text-center">20</td>
                        <td class="text-center">30</td>
                        <td class="text-center">50</td>
                        <td class="text-center">80</td>
                        <td class="text-center">100</td>
                    </tr>
                    <tr>
                        <th scope="row">Social Networks</th>
{{--                        <td class="text-center">--}}
{{--                            <i class="fab fa-facebook-f"></i>--}}
{{--                            <i class="fab fa-twitter"></i>--}}
{{--                            <i class="fab fa-instagram"></i>--}}
{{--                            <i class="fab fa-youtube"></i>--}}

{{--                            --}}{{--<i class="fab fa-linkedin-in"></i>--}}
{{--                            --}}{{--<i class="fab fa-tumblr"></i>--}}
{{--                            --}}{{--<i class="fab fa-youtube"></i>--}}
{{--                            --}}{{--<i class="fas fa-chart-line"></i>--}}
{{--                            --}}{{--<i class="fab fa-pinterest-p"></i>--}}
{{--                        </td>--}}
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            {{--<i class="fab fa-youtube"></i>--}}
                            {{--<i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            {{--<i class="fab fa-youtube"></i>--}}
                            {{--<i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            {{--<i class="fab fa-youtube"></i>--}}
                            {{--<i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            <i class="fab fa-youtube"></i>
{{--                            <i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            <i class="fab fa-youtube"></i>
{{--                            <i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            <i class="fab fa-youtube"></i>
{{--                            <i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            <i class="fab fa-youtube"></i>
{{--                            <i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                        <td class="text-center">
                            <i class="fab fa-facebook-f"></i>
                            <i class="fab fa-twitter"></i>
                            <i class="fab fa-instagram"></i>
{{--                            <i class="fab fa-linkedin-in"></i>--}}
                            {{--<i class="fab fa-tumblr"></i>--}}
                            <i class="fab fa-youtube"></i>
{{--                            <i class="fas fa-chart-line"></i>--}}
                            {{--<i class="fab fa-pinterest-p"></i>--}}
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Total Profiles</th>
{{--                        <td class="text-center">10</td>--}}
                        <td class="text-center">2</td>
                        <td class="text-center">5</td>
                        <td class="text-center">10</td>
                        <td class="text-center">20</td>
                        <td class="text-center">30</td>
                        <td class="text-center">50</td>
                        <td class="text-center">80</td>
                        <td class="text-center">100</td>
                    </tr>
                    <tr>
                        <th scope="row">Browser extension</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    <tr>
                        <th scope="row">Scheduling & Posting</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    {{--<tr>--}}
                        {{--<th scope="row">Mobile Apps iOS + Android</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    <tr>
                        <th scope="row">World Class 24*7 Training & Support</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    {{--<tr>--}}
                        {{--<th scope="row">Social Media based CRM</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    {{--<tr>--}}
                        {{--<th scope="row">Calendar</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    <tr>
                        <th scope="row">RSS Feed</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    <tr>
                        <th scope="row">Social Report</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    <tr>
                        <th scope="row">Discovery</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    {{--<tr>--}}
                        {{--<th scope="row">Twitter Engagement</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    {{--<tr>--}}
                        {{--<th scope="row">Link Shortening & Tracking</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    {{--<tr>--}}
                        {{--<th scope="row">Shareathon</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    <tr>
                        <th scope="row">Content Studio</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    {{--<tr>--}}
                        {{--<th scope="row">Socioboard Team Report</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    <tr>
                        <th scope="row">BoardMe</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}

                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    {{--<tr>--}}
                        {{--<th scope="row">Image & Shared Library</th>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-times-circle text-danger"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        {{--<td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                    {{--</tr>--}}
                    <tr>
                        <th scope="row">Custom Report</th>
{{--                        <td class="text-center"><i class="far fa-check-circle"></i></td>--}}
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-times-circle text-danger"></i></td>
                        <td class="text-center"><i class="far fa-check-circle"></i></td>
                    </tr>
                    <tr>
                        <th scope="row">Maximum Referal Count</th>
{{--                        <td class="text-center">5</td>--}}
                        <td class="text-center">2</td>
                        <td class="text-center">5</td>
                        <td class="text-center">10</td>
                        <td class="text-center">20</td>
                        <td class="text-center">30</td>
                        <td class="text-center">50</td>
                        <td class="text-center">80</td>
                        <td class="text-center">100</td>
                    </tr>
                    <tr>
                        <th scope="row">Maximum Shedule count</th>
{{--                        <td class="text-center">50</td>--}}
                        <td class="text-center">2</td>
                        <td class="text-center">5</td>
                        <td class="text-center">10</td>
                        <td class="text-center">20</td>
                        <td class="text-center">30</td>
                        <td class="text-center">50</td>
                        <td class="text-center">80</td>
                        <td class="text-center">100</td>
                    </tr>

                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Payment Modal -->
    <div class="modal fade" id="paymentModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Payments !!</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h5>Select your payment option -</h5>
                    <div class="row">
                        {{--<div class="col-md-6">--}}
                            {{--<button  id="{{env('PAY_U_MONEY')}}" class="btn col-12 payment">--}}
                                {{--<img src="../../assets/imgs/PayUmoney_Logo.jpg" class="img-fluid" />--}}
                            {{--</button>--}}
                        {{--</div>--}}
                        <div class="col-md-6">
                            <button  id="{{env('PAYPAL')}}" class="btn col-12 payment">
                                <img src="../../assets/imgs/PayPal.png" class="img-fluid" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    @endsection

{{--D:\bitbuckets\socioboard-upwork\web\app\Modules\User\Views\dashboard\planUpgradationjs.blade.php--}}
@section('script')
    @include('User::dashboard.planUpgradationjs')
    @endsection

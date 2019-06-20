'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('social_accounts',
      [
        {
          "account_id": 1,
          "account_type": 1,
          "user_name": "123062472099100",
          "first_name": "Suresh",
          "last_name": "G",
          "email": "sureshbabu@globussoft.in",
          "social_id": "123062472099100",
          "profile_pic_url": "https://graph.facebook.com/123062472099100/picture?type=large",
          "cover_pic_url": "https://graph.facebook.com/123062472099100/picture?type=large",
          "profile_url": "https://www.facebook.com/123062472099100",
          "access_token": "EAAFfZCibic1cBAMu9JF36W45LZALgVmvLp7YKQC6lgtzDmewZCmbrNlEbJavD5gyt3JiQWsOWyNPb1OGLwre4SkZA6L0nXCfEnUiVd56XPsHQz1pnhkwcWjI3Oa7uUdmdIhzAVsFiJQfRC3XRZBzaO69XqZA9hkPx6mFxwC5emBwZDZD",
          "refresh_token": "EAAFfZCibic1cBAMu9JF36W45LZALgVmvLp7YKQC6lgtzDmewZCmbrNlEbJavD5gyt3JiQWsOWyNPb1OGLwre4SkZA6L0nXCfEnUiVd56XPsHQz1pnhkwcWjI3Oa7uUdmdIhzAVsFiJQfRC3XRZBzaO69XqZA9hkPx6mFxwC5emBwZDZD",
          "friendship_counts": "0",
          "info": "",
          "account_admin_id": 1
        },
        {
          "account_id": 2,
          "account_type": 2,
          "user_name": "2828437597381653",
          "first_name": "Tests",
          "last_name": "",
          "email": "",
          "social_id": "2828437597381653",
          "profile_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/52309204_2828437684048311_4208115558261981184_n.png?_nc_cat=101&_nc_ht=scontent.xx&oh=2637abcb6d739a04137ed0056cfa42ba&oe=5D6C2186",
          "cover_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/52309204_2828437684048311_4208115558261981184_n.png?_nc_cat=101&_nc_ht=scontent.xx&oh=2637abcb6d739a04137ed0056cfa42ba&oe=5D6C2186",
          "profile_url": "https://www.facebook.com/2828437597381653",
          "access_token": "EAAFfZCibic1cBAMWTaABuMt0zRSM1Fhst2Ow0QB0nZCoejsAekN69WqakaEiQmGnvXmQUUQqq2seQa2tMZAZAbc0yRAyJpMSXERpeDJxr53uzIQfwIAzbr26SZAZC3gkYgVxreEbD426iE7AwlnGl81CJXStc4ZBQMRymmrdSc1I2huENs2GbMU",
          "refresh_token": "EAAFfZCibic1cBAMWTaABuMt0zRSM1Fhst2Ow0QB0nZCoejsAekN69WqakaEiQmGnvXmQUUQqq2seQa2tMZAZAbc0yRAyJpMSXERpeDJxr53uzIQfwIAzbr26SZAZC3gkYgVxreEbD426iE7AwlnGl81CJXStc4ZBQMRymmrdSc1I2huENs2GbMU",
          "friendship_counts": "0",
          "info": "string",
          "account_admin_id": 1
        },
        {
          "account_id": 3,
          "account_type": 2,
          "user_name": "571228450045986",
          "first_name": "SomInsta",
          "last_name": "",
          "email": "",
          "social_id": "571228450045986",
          "profile_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/c90.0.200.200a/p200x200/51931627_571228736712624_4999700832896155648_n.jpg?_nc_cat=101&_nc_ht=scontent.xx&oh=d044cdc1f463a9b5a5f8be5961f172e9&oe=5D6FAEF3",
          "cover_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/c90.0.200.200a/p200x200/51931627_571228736712624_4999700832896155648_n.jpg?_nc_cat=101&_nc_ht=scontent.xx&oh=d044cdc1f463a9b5a5f8be5961f172e9&oe=5D6FAEF3",
          "profile_url": "https://www.facebook.com/571228450045986",
          "access_token": "EAAFfZCibic1cBAOOqUohhjQWeorehjYZBEhtOyaydPjWNvoAb4fNeoGdTf9nN7epZAdZA3XeTHZCFd106sDUiNxhZBoB42vlyoILTVofW9IUdB6ffFrFhM1LLJLBc4GslIQYY5A1a6VA1IaMOjO4NN6EqDLK8YKHqvycnx5tMZBoPoJJFReJdSC",
          "refresh_token": "EAAFfZCibic1cBAOOqUohhjQWeorehjYZBEhtOyaydPjWNvoAb4fNeoGdTf9nN7epZAdZA3XeTHZCFd106sDUiNxhZBoB42vlyoILTVofW9IUdB6ffFrFhM1LLJLBc4GslIQYY5A1a6VA1IaMOjO4NN6EqDLK8YKHqvycnx5tMZBoPoJJFReJdSC",
          "friendship_counts": "0",
          "info": "string",
          "account_admin_id": 2
        },
        {
          "account_id": 4,
          "account_type": 2,
          "user_name": "315580329147156",
          "first_name": "RanInsta",
          "last_name": "",
          "email": "",
          "social_id": "315580329147156",
          "profile_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/55500760_315580399147149_7293270938701791232_n.png?_nc_cat=108&_nc_ht=scontent.xx&oh=7a316aff218f759f9bb7333bab32954f&oe=5D305D92",
          "cover_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/55500760_315580399147149_7293270938701791232_n.png?_nc_cat=108&_nc_ht=scontent.xx&oh=7a316aff218f759f9bb7333bab32954f&oe=5D305D92",
          "profile_url": "https://www.facebook.com/315580329147156",
          "access_token": "EAAFfZCibic1cBAFh5ZBNkXJq1nAoxa6ONe3yLIDNw9lV7FzbDorPy4RuoukH6anz4hZCyaZC9Nc6zy3TTEtiYxuVlNOm3SII5fxIKJoNgWMbMnZBvPfvDADNWZCVbof4Xh4TNQvAIZCVPpxoZABUxIuPdYl2e4XsGJVIqBOqIyZA4RNJGIWf1kOHW",
          "refresh_token": "EAAFfZCibic1cBAFh5ZBNkXJq1nAoxa6ONe3yLIDNw9lV7FzbDorPy4RuoukH6anz4hZCyaZC9Nc6zy3TTEtiYxuVlNOm3SII5fxIKJoNgWMbMnZBvPfvDADNWZCVbof4Xh4TNQvAIZCVPpxoZABUxIuPdYl2e4XsGJVIqBOqIyZA4RNJGIWf1kOHW",
          "friendship_counts": "0",
          "info": "string",
          "account_admin_id": 2
        },
        {
          "account_id": 5,
          "account_type": 3,
          "user_name": "264286821185080",
          "first_name": "Test",
          "last_name": "",
          "email": "",
          "social_id": "264286821185080",
          "profile_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/38403362_10150087932268692_5919425967180218368_n.png?_nc_cat=1&_nc_ht=scontent.xx&oh=60c1298255f8885d7247c38994329d7c&oe=5D75F8A7",
          "cover_pic_url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/38403362_10150087932268692_5919425967180218368_n.png?_nc_cat=1&_nc_ht=scontent.xx&oh=60c1298255f8885d7247c38994329d7c&oe=5D75F8A7",
          "profile_url": "https://www.facebook.com/264286821185080",
          "access_token": "EAAFfZCibic1cBAEw1B70lyYVxxUCaeM5q6WdVjfWWJ341LDRT1IU4peUDwyn0zv0SBERhrk0J2tjSTWv3z6ZAfsSDSXRyDCpOhFVczHVOc4NiHhFgyyFUqV5fRJZCRj3qmnV2ZA2iQQTPI86ZADwkwVlIkEQYGG0ZBvy39yapiSwZDZD",
          "refresh_token": "EAAFfZCibic1cBAEw1B70lyYVxxUCaeM5q6WdVjfWWJ341LDRT1IU4peUDwyn0zv0SBERhrk0J2tjSTWv3z6ZAfsSDSXRyDCpOhFVczHVOc4NiHhFgyyFUqV5fRJZCRj3qmnV2ZA2iQQTPI86ZADwkwVlIkEQYGG0ZBvy39yapiSwZDZD",
          "friendship_counts": "2",
          "info": "string",
          "account_admin_id": 1
        },
        {
          "account_id": 6,
          "account_type": 4,
          "user_name": "sureshg06430824",
          "first_name": "suresh g",
          "last_name": "",
          "email": "",
          "social_id": "1077838938029453300",
          "profile_pic_url": "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
          "cover_pic_url": "https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png",
          "profile_url": "https://twitter.com/intent/user?user_id=1077838938029453300",
          "access_token": "1077838938029453314-Dcm3FaDwBzHkntMTJp40BLKvViXUAk",
          "refresh_token": "6HN0aomwUfz0GNo51xhmLf2sbIdSK3bd94991ZIvo85n4",
          "friendship_counts": "1",
          "info": "",
          "account_admin_id": 1
        },
        {
          "account_id": 7,
          "account_type": 5,
          "user_name": "ranjith1616",
          "first_name": "Ranjith",
          "last_name": "",
          "email": "",
          "social_id": "10471078746",
          "profile_pic_url": "https://instagram.fsan1-2.fna.fbcdn.net/vp/41b2dda0fe1177a6198943252d3a3513/5D5480F1/t51.2885-19/44884218_345707102882519_2446069589734326272_n.jpg?_nc_ht=instagram.fsan1-2.fna.fbcdn.net",
          "cover_pic_url": "https://instagram.fsan1-2.fna.fbcdn.net/vp/41b2dda0fe1177a6198943252d3a3513/5D5480F1/t51.2885-19/44884218_345707102882519_2446069589734326272_n.jpg?_nc_ht=instagram.fsan1-2.fna.fbcdn.net",
          "profile_url": "https://www.instagram.com/ranjith1616",
          "access_token": "10471078746.7099aa0.cbc101d1c67c448d9ff6390afda472b5",
          "refresh_token": "",
          "friendship_counts": "20",
          "info": "{\"media\":2,\"follows\":20,\"followed_by\":19}",
          "account_admin_id": 1
        },
        {
          "account_id": 8,
          "account_type": 6,
          "user_name": "vA0JTLc3ym",
          "first_name": "suresh",
          "last_name": "g",
          "email": "sureshbabu@globussoft.in",
          "social_id": "vA0JTLc3ym",
          "profile_pic_url": "https://media.licdn.com/dms/image/C5103AQG8r-8Q8lwdAQ/profile-displayphoto-shrink_100_100/0?e=1562803200&v=beta&t=EDwESbb2UiIVww2I9uo7Wo7eIU1E2m2KjSe18xG6V94",
          "cover_pic_url": "https://media.licdn.com/dms/image/C5103AQG8r-8Q8lwdAQ/profile-displayphoto-shrink_100_100/0?e=1562803200&v=beta&t=EDwESbb2UiIVww2I9uo7Wo7eIU1E2m2KjSe18xG6V94",
          "profile_url": "http://www.linkedin.com/in/suresh-g-5546b5178",
          "access_token": "AQV7w0-bCIXshyybhZW9pCA-tC6jal40uUq7MXesbGUkIt4KZlMGn_YdrQRFO26iXYvGHbed1xaaFh0hpH3-L7oMwNZAU5JaIVsfjwyWziqvmDeWy_QmOLU2Yn4vPn9w6DKXmJa_qUY2PDbRa3p05YcXhlHdsvGjPTpU6OLXBtak5m0JGzdeANF4-DEz-i5i8I7yygWU5VO_6xxZDjuA98h-qsfkF9jSzK_q-t4C7V_Wc6Ec-wb4RDk_WaJskZDAC_jvQJud7OXQt1t-iUAVO-rBU85cyrVzh8yHlQnZrKAzfMoF3gtmAYNXfPG6gjsnPGqjPPG569oyu60wrqDLfjHPFLofSw",
          "refresh_token": "AQV7w0-bCIXshyybhZW9pCA-tC6jal40uUq7MXesbGUkIt4KZlMGn_YdrQRFO26iXYvGHbed1xaaFh0hpH3-L7oMwNZAU5JaIVsfjwyWziqvmDeWy_QmOLU2Yn4vPn9w6DKXmJa_qUY2PDbRa3p05YcXhlHdsvGjPTpU6OLXBtak5m0JGzdeANF4-DEz-i5i8I7yygWU5VO_6xxZDjuA98h-qsfkF9jSzK_q-t4C7V_Wc6Ec-wb4RDk_WaJskZDAC_jvQJud7OXQt1t-iUAVO-rBU85cyrVzh8yHlQnZrKAzfMoF3gtmAYNXfPG6gjsnPGqjPPG569oyu60wrqDLfjHPFLofSw",
          "friendship_counts": "16",
          "info": "",
          "account_admin_id": 1
        },
        {
          "account_id": 9,
          "account_type": 7,
          "user_name": "14537064",
          "first_name": "suresh",
          "last_name": "",
          "email": "",
          "social_id": "14537064",
          "profile_pic_url": "https://www.linkedin.com/company/14537064",
          "cover_pic_url": "string",
          "profile_url": "https://www.linkedin.com/company/14537064",
          "access_token": "AQWy27wS9q1nN3cPYV_BOlarnrKZ-lrfD-O1sQhFoEtloO2mEuQ7cdc249ZGZJA4fUzeur9IwG8y3nBLfkEslldVy9LRT1fUqCQTctwt0ZthHgVi4CzGhFgLr5xaikG62dP7qSvTu2LVhR6ghNqAIEsPXNMaAZvuGqK7r0QmbqK5y2V933VuPmp_QlzT3ATA2GCkQnYMrqxu44Fk3SOzaAeg7WzgLmF9jCaAzWUFD0ChbhJE7UWvyasKo1H0gtSdg7jz6sH7AEtDUh7PZ4Oqtj37LRiqxd-lHOP27UWK6x7Uh94kQQHVFtKiDuIna7ez2Se4qAHtAtr4t02UPrYMLSRA2rLvFg",
          "refresh_token": "AQWy27wS9q1nN3cPYV_BOlarnrKZ-lrfD-O1sQhFoEtloO2mEuQ7cdc249ZGZJA4fUzeur9IwG8y3nBLfkEslldVy9LRT1fUqCQTctwt0ZthHgVi4CzGhFgLr5xaikG62dP7qSvTu2LVhR6ghNqAIEsPXNMaAZvuGqK7r0QmbqK5y2V933VuPmp_QlzT3ATA2GCkQnYMrqxu44Fk3SOzaAeg7WzgLmF9jCaAzWUFD0ChbhJE7UWvyasKo1H0gtSdg7jz6sH7AEtDUh7PZ4Oqtj37LRiqxd-lHOP27UWK6x7Uh94kQQHVFtKiDuIna7ez2Se4qAHtAtr4t02UPrYMLSRA2rLvFg",
          "friendship_counts": "0",
          "info": "string",
          "account_admin_id": 1
        },
        {
          "account_id": 10,
          "account_type": 9,
          "user_name": "UCk74f4z1Ykxs_pL8YueS-Rg",
          "first_name": "suresh",
          "last_name": "",
          "email": "",
          "social_id": "UCk74f4z1Ykxs_pL8YueS-Rg",
          "profile_pic_url": "https://yt3.ggpht.com/a/AGF-l7_A43cgHLHqK7k6B3HToHfM-ZowAqSocHvdPQ=s88-mo-c-c0xffffffff-rj-k-no",
          "cover_pic_url": "https://yt3.ggpht.com/a/AGF-l7_A43cgHLHqK7k6B3HToHfM-ZowAqSocHvdPQ=s88-mo-c-c0xffffffff-rj-k-no",
          "profile_url": "https://www.youtube.com/channel/UCk74f4z1Ykxs_pL8YueS-Rg",
          "access_token": "ya29.GlsCB0gPcQP_fWIFy0Y_nkL_uG8pPXpTEhNed0h0tBIjQTthKDULk0QWJHSd1XK0xqI5X332mASITQFzR5nasRFpYBm0IdNd6kt73LOajVWPS9aY4qXv_p6pPVBX",
          "refresh_token": "1/43Q-exmKP7FWHm6E1swcrzf5s5xY764RXIzW6vAnog9BBjXK2LSnLfMjexbP3p5o",
          "friendship_counts": "0",
          "info": "string",
          "account_admin_id": 1
        },
        {
          "account_id": 11,
          "account_type": 10,
          "user_name": "194140606",
          "first_name": "NodeSocial",
          "last_name": "",
          "email": "sathishkumarglobussoft@gmail.com",
          "social_id": "194140606",
          "profile_pic_url": "https://nodeuser.socioboard.com",
          "cover_pic_url": "string",
          "profile_url": "https://nodeuser.socioboard.com",
          "access_token": "ya29.GlsCBwCQFxRnNx6yEfeYA9nmZxpuQewqXQ3ha0CbEJTvTZbodudaCPhDxxW5-jyzLI43CcNzEGtfKY8Idr7wVh4aqkGBjHHI9mZsTlXVF9ZyaqBW04ryechGujET",
          "refresh_token": "1/rIzBX9hPS42OpZLbmSx7BDjMN5X5jfkEL7qa91wuzyM",
          "friendship_counts": "0",
          "info": "string",
          "account_admin_id": 1
        },
        {
          "account_id": 12,
          "account_type": 11,
          "user_name": "sathishkumarglobussoft",
          "first_name": "sathishkumar",
          "last_name": "Globussoft",
          "email": "",
          "social_id": "772367542252606822",
          "profile_pic_url": "https://i.pinimg.com/60x60_RS/bd/f3/bf/bdf3bf1da3405725be763540d6601144.jpg",
          "cover_pic_url": "https://i.pinimg.com/60x60_RS/bd/f3/bf/bdf3bf1da3405725be763540d6601144.jpg",
          "profile_url": "https://www.pinterest.com/sathishkumarglobussoft/",
          "access_token": "AgDaLs4cWikdom_9vThUedNtweFyFZxWe-IviRBFove-LyCxGAq4ADAAAhVmRaNOMIFgrCMAAAAA",
          "refresh_token": "AgDaLs4cWikdom_9vThUedNtweFyFZxWe-IviRBFove-LyCxGAq4ADAAAhVmRaNOMIFgrCMAAAAA",
          "friendship_counts": "7",
          "info": "{\"pins\":9,\"following\":1,\"followers\":1,\"boards\":8}",
          "account_admin_id": 1
        },
        {
          "account_id": 13,
          "account_type": 12,
          "user_name": "17841410522398884",
          "first_name": "ranjith1616",
          "last_name": "",
          "email": "",
          "social_id": "17841410522398884",
          "profile_pic_url": "https://nodeuser.socioboard.com",
          "cover_pic_url": "string",
          "profile_url": "https://nodeuser.socioboard.com",
          "access_token": "EAAFfZCibic1cBAHw9s1R7TzaZBJHRtRBUbdaLgziHYq4ttoVJZCTXuQQn6k1iT6bmZCQRSM6F9R4753wVazJW8MBufVLIBT7P7I0zvFsPHt7Ui06lL1Vz2LZBRYFW0y3FYUNEcZBBJu8AAZB73GkIwFbpZBgFhZCsNWOKDv5DVKpXTZBDb9Oq05cnZC",
          "refresh_token": "EAAFfZCibic1cBAHw9s1R7TzaZBJHRtRBUbdaLgziHYq4ttoVJZCTXuQQn6k1iT6bmZCQRSM6F9R4753wVazJW8MBufVLIBT7P7I0zvFsPHt7Ui06lL1Vz2LZBRYFW0y3FYUNEcZBBJu8AAZB73GkIwFbpZBgFhZCsNWOKDv5DVKpXTZBDb9Oq05cnZC",
          "friendship_counts": "20",
          "info": "string",
          "account_admin_id": 1
        }
      ])
      .then(() => {
        queryInterface.bulkInsert('join_table_teams_social_accounts', [
          {
            "id": 1,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 1
          },
          {
            "id": 2,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 2
          },
          {
            "id": 3,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 3
          },
          {
            "id": 4,
            "is_account_locked": 0,
            "team_id": 4,
            "account_id": 4
          },

          {
            "id": 5,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 5
          },
          {
            "id": 6,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 6
          },
          {
            "id": 7,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 7
          },
          {
            "id": 8,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 8
          },
          {
            "id": 9,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 9
          },

          {
            "id": 10,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 10
          },
          {
            "id": 11,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 11
          },
          {
            "id": 12,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 12
          },
          {
            "id": 13,
            "is_account_locked": 0,
            "team_id": 5,
            "account_id": 13
          }
        ]);
      })
      .then(() => {
        return queryInterface.bulkInsert('pinterest_boards', [
          {
            "id": 1,
            "board_id": "772367473533360452",
            "board_name": "string123321",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/string123321/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          },
          {
            "id": 2,
            "board_id": "772367473533318666",
            "board_name": "Emoji",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/emoji/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          },
          {
            "id": 3,
            "board_id": "772367473533318668",
            "board_name": "SocioNodes",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/socionodes/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          },
          {
            "id": 4,
            "board_id": "772367473533322637",
            "board_name": "Checker",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/checker/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          },
          {
            "id": 5,
            "board_id": "772367473533367632",
            "board_name": "cars",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/cars/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          },
          {
            "id": 6,
            "board_id": "772367473533361011",
            "board_name": "string12345",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/string12345/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          },
          {
            "id": 7,
            "board_id": "772367473533360440",
            "board_name": "string",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/string/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          },
          {
            "id": 8,
            "board_id": "772367473533360441",
            "board_name": "4",
            "board_url": "https://www.pinterest.com/sathishkumarglobussoft/4/",
            "privacy": "public",
            "board_admin_name": "sathishkumar Globussoft",
            "board_admin_id": "772367542252606822",
            "board_admin_url": "https://www.pinterest.com/sathishkumarglobussoft/",
            "social_account_id": 12
          }
        ]);
      });

  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('social_accounts', null, {})
      .then(() => {
        return queryInterface.bulkDelete('join_table_teams_social_accounts', null, {});
      })
      .then(() => {
        return queryInterface.bulkDelete('pinterest_boards', null, {});
      });
  }
};

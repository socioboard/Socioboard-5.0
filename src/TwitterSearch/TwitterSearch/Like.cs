using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;

namespace TwitterSearch.TwitterSearch
{
    public class Like : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;

        public void OnPropertyChanged([CallerMemberName] string Property = "")
        {
            if (PropertyChanged != null)
            {
                this.PropertyChanged(this, new PropertyChangedEventArgs(Property));
            }
        }
      

        private List<string> lstofSelectedEmails;

        public List<string> LstofSelectedEmails
        {
            get { return lstofSelectedEmails; }
            set { lstofSelectedEmails = value; OnPropertyChanged("LstofSelectedEmails"); }
        }

        private bool _IsScheduled;

        private DateTime _ScheduledTime;

        public DateTime ScheduledTime
        {
            get
            {
                return _ScheduledTime;
            }
            set
            {
                _ScheduledTime = value;
                OnPropertyChanged("ScheduledTime");
            }
        }

        public bool IsScheduled
        {
            get
            {
                return _IsScheduled;
            }
            set
            {
                _IsScheduled = value;
                OnPropertyChanged("IsScheduled");
            }
        }

        private int _noOfFinalLikePerday;

        public int NoOfFinalLikePerday
        {
            get { return _noOfFinalLikePerday; }
            set { _noOfFinalLikePerday = value; OnPropertyChanged("NoOfFinalFollowPerday"); }
        }


        private List<string> _listOfKeyWordToSearch;

        public List<string> ListOfKeyWordToSearch
        {
            get { return _listOfKeyWordToSearch; }
            set { _listOfKeyWordToSearch = value; OnPropertyChanged("ListOfKeyWordToSearch"); }
        }


        private bool _isLoadTweetUrl;

        public bool IsLoadTweetUrl
        {
            get { return _isLoadTweetUrl; }
            set { _isLoadTweetUrl = value; OnPropertyChanged("IsLoadTweetUrl"); }
        }

        private bool _isFindFromSpecificUser;

        public bool IsFindFromSpecificUser
        {
            get { return _isFindFromSpecificUser; }
            set { _isFindFromSpecificUser = value; OnPropertyChanged("IsFindFromSpecificUser"); }
        }

        private bool _isFindWithKeyword;

        public bool IsFindWithKeyword
        {
            get { return _isFindWithKeyword; }
            set { _isFindWithKeyword = value; OnPropertyChanged("IsFindWithKeyword"); }
        }

        private bool _IsFindLocation;

        public bool IsFindLocation
        {
            get { return _IsFindLocation; }
            set { _IsFindLocation = value; OnPropertyChanged("IsFindLocation"); }
        }

        private bool _isSomoneFollowers;

        public bool IsSomoneFollowers
        {
            get { return _isSomoneFollowers; }
            set { _isSomoneFollowers = value; OnPropertyChanged("IsSomoneFollowers"); }
        }

        private bool _isSomoneFollowing;

        public bool IsSomoneFollowing
        {
            get { return _isSomoneFollowing; }
            set { _isSomoneFollowing = value; OnPropertyChanged("IsSomoneFollowing"); }
        }

        private bool _isOwnFollowers;

        public bool IsOwnFollowers
        {
            get { return _isOwnFollowers; }
            set { _isOwnFollowers = value; OnPropertyChanged("IsOwnFollowers"); }
        }

        private bool _isOwnFollowing;

        public bool IsOwnFollowing
        {
            get { return _isOwnFollowing; }
            set { _isOwnFollowing = value; OnPropertyChanged("IsOwnFollowing"); }
        }

        private string _ttxtUploadedData;

        public string txtUploadedData
        {
            get { return _ttxtUploadedData; }
            set { _ttxtUploadedData = value; OnPropertyChanged("txtUploadedData"); }
        }

        private int _noOfThreads;

        public int NoOfThreads
        {
            get { return _noOfThreads; }
            set { _noOfThreads = value; OnPropertyChanged("NoOfThreads"); }
        }

        private int _minDelayPauseEachJob;

        public int MinDelayPauseEachJob
        {
            get { return _minDelayPauseEachJob; }
            set { _minDelayPauseEachJob = value; OnPropertyChanged("MinDelayPauseEachJob"); }
        }

        private int _maxDelayPauseEachJob;

        public int MaxDelayPauseEachJob
        {
            get { return _maxDelayPauseEachJob; }
            set { _maxDelayPauseEachJob = value; OnPropertyChanged("MaxDelayPauseEachJob"); }
        }

        private int _minDelayRepostEachJob;

        public int MinDelayRepostEachJob
        {
            get { return _minDelayRepostEachJob; }
            set { _minDelayRepostEachJob = value; OnPropertyChanged("MinDelayRepostEachJob"); }
        }

        private int _maxDelayRepostEachJob;

        public int MaxDelayRepostEachJob
        {
            get { return _maxDelayRepostEachJob; }
            set { _maxDelayRepostEachJob = value; OnPropertyChanged("MaxDelayRepostEachJob"); }
        }

        private int _minDelayPauseEachRepost;

        public int MinDelayPauseEachRepost
        {
            get { return _minDelayPauseEachRepost; }
            set { _minDelayPauseEachRepost = value; OnPropertyChanged("MinDelayPauseEachRepost"); }
        }

        private int _maxDelayPauseEachRepost;

        public int MaxDelayPauseEachRepost
        {
            get { return _maxDelayPauseEachRepost; }
            set { _maxDelayPauseEachRepost = value; OnPropertyChanged("MaxDelayPauseEachRepost"); }
        }

        private int _minDelayRepostPerDay;

        public int MinDelayRepostPerDay
        {
            get { return _minDelayRepostPerDay; }
            set { _minDelayRepostPerDay = value; OnPropertyChanged("MinDelayRepostPerDay"); }
        }

        private int _maxDelayRepostPerDay;

        public int MaxDelayRepostPerDay
        {
            get { return _maxDelayRepostPerDay; }
            set { _maxDelayRepostPerDay = value; OnPropertyChanged("MaxDelayRepostPerDay"); }
        }

        private int _ncreasePerDay;

        public int increasePerDay
        {
            get { return _ncreasePerDay; }
            set { _ncreasePerDay = value; OnPropertyChanged("increasePerDay"); }
        }

        private int _axincreaseTotalActionCount;

        public int maxincreaseTotalActionCount
        {
            get { return _axincreaseTotalActionCount; }
            set { _axincreaseTotalActionCount = value; OnPropertyChanged("maxincreaseTotalActionCount"); }
        }

        private bool _isFilterByIgnoreTweetsSpecifyDay;

        public bool IsFilterByIgnoreTweetsSpecifyDay
        {
            get { return _isFilterByIgnoreTweetsSpecifyDay; }
            set { _isFilterByIgnoreTweetsSpecifyDay = value; OnPropertyChanged("IsFilterByIgnoreTweetsSpecifyDay"); }
        }

        private int _noSpecifyDay;

        public int NoSpecifyDay
        {
            get { return _noSpecifyDay; }
            set { _noSpecifyDay = value; OnPropertyChanged("NoSpecifyDay"); }
        }
        private bool _isFilterByComments;

        public bool IsFilterByComments
        {
            get { return _isFilterByComments; }
            set { _isFilterByComments = value; OnPropertyChanged("IsFilterByComments"); }
        }

        private int _minComments;

        public int MinComments
        {
            get { return _minComments; }
            set { _minComments = value; OnPropertyChanged("MinComments"); }
        }

        private int _maxComments;

        public int MaxComments
        {
            get { return _maxComments; }
            set { _maxComments = value; OnPropertyChanged("MaxComments"); }
        }

        private bool _isFilterByLikes;

        public bool IsFilterByLikes
        {
            get { return _isFilterByLikes; }
            set { _isFilterByLikes = value; OnPropertyChanged("IsFilterByLikes"); }
        }

        private int _minLike;

        public int MinLike
        {
            get { return _minLike; }
            set { _minLike = value; OnPropertyChanged("MinLike"); }
        }

        private int _maxLike;

        public int MaxLike
        {
            get { return _maxLike; }
            set { _maxLike = value; }
        }

        private bool _isFilterByRetweets;

        public bool IsFilterByRetweets
        {
            get { return _isFilterByRetweets; }
            set { _isFilterByRetweets = value; OnPropertyChanged("IsFilterByRetweets"); }
        }

        private int _minRetweets;

        public int MinRetweets
        {
            get { return _minRetweets; }
            set { _minRetweets = value; OnPropertyChanged("MinRetweets"); }
        }

        private int _maxRetweets;

        public int MaxRetweets
        {
            get { return _maxRetweets; }
            set { _maxRetweets = value; OnPropertyChanged("MaxRetweets"); }
        }

        private string _btn_ProcessButton;

        public string Btn_ProcessButton
        {
            get { return _btn_ProcessButton; }
            set { _btn_ProcessButton = value; OnPropertyChanged("Btn_ProcessButton"); }
        }


        #region Old Data
        private string groupName = string.Empty;
        private string account = string.Empty;

        private string singleUsername = string.Empty;
        private string multipleUsernameFilePath = string.Empty;
        private string likeStartTime = string.Empty;
        private string likeEndTime = string.Empty;

        private string _batch1Hours = string.Empty;
        private string _batch1Min = string.Empty;
        private string _batch1Percentage = string.Empty;

        private string _batch2Hours = string.Empty;
        private string _batch2Min = string.Empty;
        private string _batch2Percentage = string.Empty;

        private string _batch3Hours = string.Empty;
        private string _batch3Min = string.Empty;
        private string _batch3Percentage = string.Empty;

        private string _batchDate = string.Empty;

        private int noOfLikeCount = 0;
        private int noOfThread = 10;
        private int delay = 15;
        private int delaymin = 15;
        private int delaymax = 30;
        private int minComments = 0;
        private int maxComments = 0;
        private int minLike = 0;
        private int maxLike = 0;
        private int minRetweets = 0;
        private int maxRetweets = 0;
        private int noSpecifyDay = 0;
        private int minTweetPost = 0;
        private int maxTweetPost = 0;

        private bool isStopLike = false;
        private bool isSingleUsernameANDisMultipleUsername = false;
        private bool isMultipleUsername = false;
        private bool isSimpleLike = false;
        private bool isAutoLike = false;
        private bool isScheduleDaily = false;

        private List<string> lstOfUserIdToLike = new List<string>();
        private List<string> listOfInputedList = new List<string>();

        private bool isFindandLike = false;


        private bool isFindLocation = false;
        private bool isSomoneFollowers = false;
        private bool isSomoneFollowing = false;
        private bool isOwnFollowers = false;
        private bool isOwnFollowing = false;
        private bool isFilterByIgnoreTweetsSpecifyDay = false;
        private bool isFilterByComments = false;
        private bool isFilterByLikes = false;
        private bool isFilterByRetweets = false;
        private bool isNumberTweetsBetween = false;

        private List<string> lstOfLoadedTweetUrls = new List<string>();
        private List<string> lstOfLoadedKeywords = new List<string>();
        private List<string> lstOfLoadedSpecificUser = new List<string>();
        private List<string> lstofEmails = new List<string>();
        private List<string> batchKeyAll = new List<string>();






        public string GroupName
        {
            get
            {
                return groupName;
            }

            set
            {
                groupName = value; OnPropertyChanged("GroupName");
            }
        }

        public string Account
        {
            get
            {
                return account;
            }

            set
            {
                account = value; OnPropertyChanged("Account");
            }
        }

        public string SingleUsername
        {
            get
            {
                return singleUsername;
            }

            set
            {
                singleUsername = value; OnPropertyChanged("SingleUsername");
            }
        }

        public string MultipleUsernameFilePath
        {
            get
            {
                return multipleUsernameFilePath;
            }

            set
            {
                multipleUsernameFilePath = value; OnPropertyChanged("MultipleUsernameFilePath");
            }
        }

        public int NoOfLikeCount
        {
            get
            {
                return noOfLikeCount;
            }

            set
            {
                noOfLikeCount = value; OnPropertyChanged("NoOfLikeCount");
            }
        }

        public int NoOfThread
        {
            get
            {
                return noOfThread;
            }

            set
            {
                noOfThread = value; OnPropertyChanged("NoOfThread");
            }
        }

        public int Delay
        {
            get
            {
                return delay;
            }

            set
            {
                delay = value; OnPropertyChanged("Delay");
            }
        }

        public int Delaymin
        {
            get
            {
                return delaymin;
            }

            set
            {
                delaymin = value; OnPropertyChanged("Delaymin");
            }
        }

        public int Delaymax
        {
            get
            {
                return delaymax;
            }

            set
            {
                delaymax = value; OnPropertyChanged("Delaymin");
            }
        }

        public bool IsSingleUsernameANDisMultipleUsername
        {
            get
            {
                return isSingleUsernameANDisMultipleUsername;
            }

            set
            {
                isSingleUsernameANDisMultipleUsername = value; OnPropertyChanged("Delaymin");
            }
        }

        public bool IsMultipleUsername
        {
            get
            {
                return isMultipleUsername;
            }

            set
            {
                isMultipleUsername = value; OnPropertyChanged("IsMultipleUsername");
            }
        }

        public bool IsSimpleLike
        {
            get
            {
                return isSimpleLike;
            }

            set
            {
                isSimpleLike = value; OnPropertyChanged("IsSimpleLike");
            }
        }

        public bool IsAutoLike
        {
            get
            {
                return isAutoLike;
            }

            set
            {
                isAutoLike = value; OnPropertyChanged("IsAutoLike");
            }
        }

        public bool IsScheduleDaily
        {
            get
            {
                return isScheduleDaily;
            }

            set
            {
                isScheduleDaily = value; OnPropertyChanged("IsScheduleDaily");
            }
        }

        public List<string> LstOfUserIdToLike
        {
            get
            {
                return lstOfUserIdToLike;
            }

            set
            {
                lstOfUserIdToLike = value; OnPropertyChanged("LstOfUserIdToLike");
            }
        }

        public string LikeStartTime
        {
            get
            {
                return likeStartTime;
            }

            set
            {
                likeStartTime = value; OnPropertyChanged("LikeStartTime");
            }
        }

        public string LikeEndTime
        {
            get
            {
                return likeEndTime;
            }

            set
            {
                likeEndTime = value; OnPropertyChanged("LikeEndTime");
            }
        }

        public bool IsStopLike
        {
            get
            {
                return isStopLike;
            }

            set
            {
                isStopLike = value; OnPropertyChanged("IsStopLike");
            }
        }


        public bool IsFindandLike
        {
            get
            {
                return isFindandLike;
            }

            set
            {
                isFindandLike = value; OnPropertyChanged("IsFindandLike");
            }
        }




        public List<string> LstOfLoadedTweetUrls
        {
            get
            {
                return lstOfLoadedTweetUrls;
            }

            set
            {
                lstOfLoadedTweetUrls = value; OnPropertyChanged("LstOfLoadedTweetUrls");
            }
        }

        public List<string> LstOfLoadedKeywords
        {
            get
            {
                return lstOfLoadedKeywords;
            }

            set
            {
                lstOfLoadedKeywords = value; OnPropertyChanged("LstOfLoadedKeywords");
            }
        }

        public List<string> LstOfLoadedSpecificUser
        {
            get
            {
                return lstOfLoadedSpecificUser;
            }

            set
            {
                lstOfLoadedSpecificUser = value; OnPropertyChanged("LstOfLoadedSpecificUser");
            }
        }

        public List<string> LstofEmails
        {
            get
            {
                return lstofEmails;
            }

            set
            {
                lstofEmails = value; OnPropertyChanged("LstofEmails");
            }
        }

        public string Batch1Hours
        {
            get
            {
                return _batch1Hours;
            }

            set
            {
                _batch1Hours = value; OnPropertyChanged("Batch1Hours");
            }
        }

        public string Batch1Min
        {
            get
            {
                return _batch1Min;
            }

            set
            {
                _batch1Min = value; OnPropertyChanged("Batch1Min");
            }
        }

        public string Batch1Percentage
        {
            get
            {
                return _batch1Percentage;
            }

            set
            {
                _batch1Percentage = value; OnPropertyChanged("Batch1Percentage");
            }
        }

        public string Batch2Hours
        {
            get
            {
                return _batch2Hours;
            }

            set
            {
                _batch2Hours = value; OnPropertyChanged("Batch2Hours");
            }
        }

        public string Batch2Min
        {
            get
            {
                return _batch2Min;
            }

            set
            {
                _batch2Min = value; OnPropertyChanged("Batch2Min");
            }
        }

        public string Batch2Percentage
        {
            get
            {
                return _batch2Percentage;
            }

            set
            {
                _batch2Percentage = value; OnPropertyChanged("Batch2Percentage");
            }
        }

        public string Batch3Hours
        {
            get
            {
                return _batch3Hours;
            }

            set
            {
                _batch3Hours = value; OnPropertyChanged("Batch3Hours");
            }
        }

        public string Batch3Min
        {
            get
            {
                return _batch3Min;
            }

            set
            {
                _batch3Min = value; OnPropertyChanged("Batch3Min");
            }
        }

        public string Batch3Percentage
        {
            get
            {
                return _batch3Percentage;
            }

            set
            {
                _batch3Percentage = value; OnPropertyChanged("Batch3Percentage");
            }
        }

        public List<string> BatchKeyAll
        {
            get
            {
                return batchKeyAll;
            }

            set
            {
                batchKeyAll = value; OnPropertyChanged("BatchKeyAll");
            }
        }

        public string BatchDate
        {
            get
            {
                return _batchDate;
            }

            set
            {
                _batchDate = value; OnPropertyChanged("BatchDate");
            }
        }


        public List<string> ListOfInputedList
        {
            get
            {
                return listOfInputedList;
            }

            set
            {
                listOfInputedList = value; OnPropertyChanged("ListOfInputedList");
            }
        }


        public int MinTweetPost
        {
            get
            {
                return minTweetPost;
            }

            set
            {
                minTweetPost = value; OnPropertyChanged("MinTweetPost");
            }
        }

        public int MaxTweetPost
        {
            get
            {
                return maxTweetPost;
            }

            set
            {
                maxTweetPost = value; OnPropertyChanged("MaxTweetPost");
            }
        }

        public bool IsNumberTweetsBetween
        {
            get
            {
                return isNumberTweetsBetween;
            }

            set
            {
                isNumberTweetsBetween = value; OnPropertyChanged("IsNumberTweetsBetween");
            }
        }
        #endregion
    }

}

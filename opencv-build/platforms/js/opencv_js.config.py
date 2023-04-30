# Classes and methods whitelist

imgproc = {
    '': [
        'cvtColor',
        'pyrDown',
        'resize',
    ],
}

objdetect = {'': ['groupRectangles'],
             'CascadeClassifier': ['load', 'detectMultiScale2', 'CascadeClassifier', 'detectMultiScale3', 'empty', 'detectMultiScale'],
             }

white_list = makeWhiteList([imgproc, objdetect])

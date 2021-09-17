let db = {
    users: [
        {
            userId: '1df53vb15fdbv15fd1bfd51vfd51vf',
            email: 'user@email.com',
            handle: 'user',
            createdAt: '2017-03-31T22:54:52.621Z',
            imageUrl: 'https://image/sdkjvnd/',
            bio: 'Hello, my name is user...',
            website: 'http://user.com',
            location: 'Houston, TX'
        }
    ],
    screams: [
        { 
            userHandle: 'user',
            body: 'this is a scream body',
            createdAt: '2021-08-31T22:54:52.621Z',
            likeCount: 5,
            commentCount: 2,
        }
    ],
    comments: [
        {
            userHandle: 'user',
            screamId: 'kdjsfgdksuufhgkdsufky',
            body: 'nice one mate!',
            createdAt: '2019-03-15T10:59:52.798Z'
        }
    ],
};

const userDetails = {
  // Redux data
    credentials: {
        userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
        email: 'user@email.com',
        handle: 'user',
        createdAt: '2019-03-15T10:59:52.798Z',
        imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
        bio: 'Hello, my name is user, nice to meet you',
        website: 'https://user.com',
        location: 'Lonodn, UK'
    },
    likes: [
        {
            userHandle: 'user',
            screamId: 'hh7O5oWfWucVzGbHH2pa'
        },
        {
            userHandle: 'user',
            screamId: '3IOnFoQexRcofs5OhBXO'
        }
    ]
};
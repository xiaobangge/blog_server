const STS  = require('qcloud-cos-sts')
const config = {
  durationSeconds: 1800,
  secretId: '*****************************',
  secretKey: '***********',
  proxy: '',

  bucket: '****************',
  region: '*****************',
  allowPrefix: '.png|.jpg|.jpeg|.gif|.bmp|.ico|.svg',
  allowActions: [
    'name/cos:PutObject',
    'name/cos:PostObject',
    'name/cos:InitiateMultipartUpload',
    'name/cos:ListMultipartUploads',
    'name/cos:ListParts',
    'name/cos:UploadPart',
    'name/cos:CompleteMultipartUpload'
  ]
}

module.exports={
    getCredential: (req,res)=>{
        var shortBucketName = config.bucket.substr(0 , config.bucket.lastIndexOf('-'));
        var appId = config.bucket.substr(1 + config.bucket.lastIndexOf('-'));
        var policy = {
            'version': '2.0',
            'statement': [{
                'action': config.allowActions,
                'effect': 'allow',
                'principal': {'qcs': ['*']},
                'resource': [
                    'qcs::cos:' + config.region + ':uid/' + appId + ':prefix//' + appId + '/' + shortBucketName + '/' + config.allowPrefix,
                ],
            }],
        };
        STS.getCredential({
            secretId: config.secretId,
            secretKey: config.secretKey,
            proxy: config.proxy,
            durationSeconds: config.durationSeconds,
            policy: policy,
        }, function (err, tempKeys) {
            var result = JSON.stringify(err || tempKeys) || '';
            console.log('result: ',result)
            res.send(result)
        });
    }
}
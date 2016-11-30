
var mf = module.filename.substring(0, module.filename.length - 'Gruntparts.js'.length);
exports.mf = mf;

exports.envname = 'TEMPLATES_APOLLO'; // ENV var that (if set) will override the template selection
exports.themes = [ 
	'style-blue', 
	'style-red'
];

exports.deployTarget = process.env.OCMOUNT + '/system/modules/org.opencms.apollo.theme/resources/';

exports.sassSrc = [
	mf + '*.scss', 
];

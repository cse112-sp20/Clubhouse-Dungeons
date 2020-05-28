# Quaranteam8 Database

## This is an example documenting how data is structured inside the Database

###	'quaranteam-08':
	{
		// all Clubhouse workspaces that are using our extension
		'workspaces': {
			'marvel': {
				'tStark': {
					'honored': 0
				},
				'sRodgers': {
					'honored': 2,
					'honoredBy': {
						'nFury': true,
						'sLee': true
					}
				},
				'nFury': {
					'honored': 0
				},
				... ,
				'iterationLength': 365,
				'iterationStart': '1939-1-1T0:0:0Z',
				'iterationEnd': '1939-12-31T23:59:59Z'
			}, 
			'dc': {
				'bWayne': {
					'honored': 0
				},
				'cKent': {
					'honored': 1,
					'honoredBy': {
						'lLane': true
					}
				},
				... ,
				'iterationLength': 365,
				'iterationStart': '1934-1-1T0:0:0Z',
				'iterationEnd': '1934-12-31T23:59:59Z'
			},
			...
		}
	}
		
## Notes
* '...' is used to show that there is additional information that is not shown
	* the information it is hiding is in the same format as shown in previous examples
* often times we will be indexing by using a key and checking if it is null
* if using VS Code to view this file, you can view the Markdown preview by either:
	* right-clicking the tab of the file and select 'Open Preview'
	* (Ctrl/Cmd) - Shift - V
* structure guide referenced: [Structure Your Database](https://firebase.google.com/docs/database/web/structure-data)

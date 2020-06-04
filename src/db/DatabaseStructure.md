# Quaranteam8 Database

## This is an example documenting how data is structured inside the Database

###	'quaranteam-08':
	{
		// all Clubhouse workspaces that are using our extension
		'workspaces': {
			'marvel': {
				'iterationId1': {
					'tStark': {
						'honorRecognitionsRemaining': 3,
						'honoredBy': false
					},
					'sRodgers': {
						'honorRecognitionsRemaining': 3,
						'honoredBy': {
							'nFury': true,
							'sLee': true
						}
					},
					'nFury': {
						'honorRecognitionsRemaining': 2,
						'honoredBy': false
					}
				}, 
				'iterationId2': {
					...
				},
				...
			}, 
			'dc': {
				'iterationId1': {
					'bWayne': {
						'honorRecognitionsRemaining': 3,
						'honoredBy': false
					},
					'cKent': {
						'honorRecognitionsRemaining': 3,
						'honoredBy': {
							'lLane': true
						}
					},
					...
				},
				'iterationId2': {
					...
				},
				...
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
* 3 is the maximum amount of members a single member is able to honor
	* the amount of times they have left to honor other members is represented by the object honorRecognitionsRemaining (i.e. if you honor a single member, you will have 2 honorRecognitionsRemaining instead of the maximum 3)
* structure guide referenced: [Structure Your Database](https://firebase.google.com/docs/database/web/structure-data)

# Quaranteam8 Database
##	'quaranteam8':
	{
		// all Clubhouse organizations that are using our extension
		'organizations': {
			'marvel': {
				'members': {
					'tStark': true,
					'sRodgers': true,
					'pParker': true,
					...
				},
				'honoredMembers': {
					'sRodgers': true,
					...
				},
				'iterationLength': 365,
				'iterationStart': '1939-1-1T0:0:0Z',
				'iterationEnd': '1939-12-31T23:59:59Z'
			}, 
			'dc': {
				'members': {
					'bWayne': true,
					'cKent': true,
					'hJordan': true,
					...
				},
				'honoredMembers': {
					'cKent': true,
					...
				},
				'iterationLength': 365,
				'iterationStart': '1934-1-1T0:0:0Z',
				'iterationEnd': '1934-12-31T23:59:59Z'
			},
			...
		},
		'allUsers': {
			// in our extension, the user keys will be their Clubhouse member id
			'tStark': {
				'name': 'Tony Stark',
				'organizations': {
					'marvel': true
				}
			},
			'sRodgers': {
				'name': 'Steve Rodgers',
				'organizations': {
					'marvel': true
				},
				'honored': true,
				'timesHonored': 2
			},
			'bWayne': {
				'name': 'Bruce Wayne',
				'organizations': {
					'dc': true
				}
			},
			'cKent': {
				'name': 'Clark Kent',
				'organizations': {
					'dc': true
				},
				...
			}
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

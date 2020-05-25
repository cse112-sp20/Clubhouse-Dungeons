# Quaranteam8 Database
##	'quaranteam8':
	{
		'projects': {
			// in our extension, the projects key will be the Clubhouse project id
			'avengersInitiative': {
				'name': 'The Avengers Initiative',
				'members': {
					'tStark': true,
					'sRodgers': true,
					...
				},
				'honoredMembers': {
					'sRodgers': true,
					...
				}
			},
			'justiceLeague': {
				'name': 'The Justice League',
				'members': {
					'bWayne': true,
					'cKent': true,
					...
				},
				'honoredMembers': {
					'cKent': true,
					...
				}
			},
			...
		},
		'users': {
			// in our extension, the users key will be the Clubhouse member id
			'tStark': {
				'name': 'Tony Stark',
				'projects': {
					'avengersInitiative': true
				}
			},
			'sRodgers': {
				'name': 'Steve Rodgers',
				'projects': {
					'avengersInitiative': true
				},
				'honored': true,
				'timesHonored': 2
			},
			'bWayne': {
				'name': 'Bruce Wayne',
				'projects': {
					'justiceLeague': true
				},
				...
			},
			'cKent': {
				'name': 'Clark Kent',
				'projects': {
					'justiceLeague': true
				},
				...
			}
			...
		},
		'honoredUsers': {
			'sRodgers': true,
			'cKent': true,
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

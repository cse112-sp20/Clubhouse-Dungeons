# Chrome Webstore Content Overview
[Link to Page](https://chrome.google.com/webstore/detail/fkecccpikcmpaednaokcaajmdoimmpch/publish-accepted?authuser=4&hl=en)

# Content

## Defined in the Manifest File
### Title
Clubhouse Dungeons

### Description
Gamify your Clubhouse Experience

### Current Version
1.1

## On the Web Store Dashboard
### Detailed Description
Gamify your Clubhouse experience to keep your team motivated.

Use our extension to:
-  See  Clubhouse Stories that have been assigned to you
-  Complete Clubhouse Stories from any page
-  Be aware of how your team is progressing through the current sprint
-  Praise your teammates for their hard work
-  Earn rewards for completing sprints

Happy Hunting!

### Screenshots
Only have our team logo right now

### Optional
-  Promo Video
-  Promo Title(small, Large, Marquee)

### Single Purpose Description
Bring Clubhouse Tasks to your browser and gamify agile sprints. It enables users to manage their tasks and see how many are left in the sprint by seeing the bosses health.

### Permission Justification
| Permission | Justification                                                                                                                                                   |
|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| storage    | We use storage to store the user's Clubhouse API Tokens to remember the user's account such that they don't have to sign in every time they open the extension. |

## Deployment Process
Each time our chrome extension is ready for deployment we will update the version of the manifest incrementally, and then create a pull request from develop into master.

After being reviewed and approved by at least 6 members, the pull request can be merged into master.

This will spawn a workflow that builds, zips, and uploads the current chrome extenstion to the Chrome Web Store which will then need to be submitted to be reviewed via the dashboard and then published once it is reviewed.
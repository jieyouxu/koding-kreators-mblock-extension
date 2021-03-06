# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.10.0] - 2018-07-18
### Added
- zh_CN localization support.

## [1.9.0] - 2018-07-05
### Added
- Added speaker support.

## [1.8.2] - 2018-07-05
### Fixed
- LED plugin support in Arduino mode.

## [1.8.0] - 2018-07-02
### Added
- Added LED strip support (basic function, can be refactored in the future).

## [1.7.0] - 2018-07-01
### Added
- Added servo motor wrapper.

## [1.6.0] - 2018-07-01
### Added
- Added read ultrasonic sensor block (pins are hardcoded for now, can be improved in the future).

## [1.5.0] - 2018-07-01
### Added
- Added write digital sensor block.

## [1.4.0] - 2018-07-01
### Added
- Added read digital sensor block.
### Changed
- Modified UI mapping of values for sensor IDs.

## [1.3.0] - 2018-06-30
### Changed
- Refactored read analog sensor blocks to utilize drop down menu.

## [1.2.0] - 2018-06-29
### Added
- Added read green button state block.

## [1.1.0] - 2018-06-29
### Added
- Added read potentiometer (alias "knob") block.
### Changed
- Modified git workflow.

## [1.0.1] - 2018-06-28
### Fixed
- Fixed Arduino code syntax issue when trying to use value from analog sensor in condition expressions.
- Fixed missing header file due to naming issue.

## [1.0.0] - 2018-06-28
### Added
- Initial release.
- Added read blocks for analog sensors (#1-4).
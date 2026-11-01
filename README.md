# issue-fleet-scratch

A scratch repository for the spikes of [timmattison/megarepo issue #1029](https://github.com/timmattison/megarepo/issues/1029). Delete it after the spikes, or keep it as Tim says.

The code is small TypeScript that Node runs directly. Run the tests with `pnpm test` (`node --test`). There are no packages to install.

The CI workflow runs on each pull request, on each merge group of the merge queue, and on each push to `main`. In a merge group, it fails when the file `FAIL_IN_MERGE_QUEUE` exists, so that a spike can make the queue remove a pull request.

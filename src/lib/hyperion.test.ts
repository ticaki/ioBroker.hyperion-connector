import { expect } from 'chai';
import { compareVersions, parseHyperionVersion } from './hyperion';

describe('hyperion version helpers', () => {
    it('parses plain, prefixed and pre-release versions', () => {
        expect(parseHyperionVersion('2.2.0')).to.deep.equal([2, 2, 0]);
        expect(parseHyperionVersion('2.0.17-beta.1+PR1234')).to.deep.equal([2, 0, 17]);
        expect(parseHyperionVersion('Hyperion 2.1.1 (nightly)')).to.deep.equal([2, 1, 1]);
        expect(parseHyperionVersion('2.2.2-beta.1')).to.deep.equal([2, 2, 2]);
    });

    it('returns undefined for missing or malformed versions', () => {
        expect(parseHyperionVersion(undefined)).to.equal(undefined);
        expect(parseHyperionVersion(220)).to.equal(undefined);
        expect(parseHyperionVersion('2.2')).to.equal(undefined);
    });

    it('compares versions numerically, not lexically', () => {
        expect(compareVersions([2, 0, 16], [2, 0, 17])).to.be.lessThan(0);
        expect(compareVersions([2, 0, 17], [2, 0, 17])).to.equal(0);
        expect(compareVersions([2, 10, 0], [2, 9, 9])).to.be.greaterThan(0);
        expect(compareVersions([3, 0, 0], [2, 99, 99])).to.be.greaterThan(0);
        expect(compareVersions([1, 5, 0], [2, 0, 17])).to.be.lessThan(0);
    });
});

using Application.Abstractions.Security;
using Infrastructure.Security;
using Xunit;

namespace UnitTests;

public class RecoveryCodeServiceTests
{
    private readonly IRecoveryCodeService _sut = new RecoveryCodeService();

    [Fact]
    public void Generate_ReturnsRequestedCount_AndUniqueCodes()
    {
        var set = _sut.Generate(10);

        Assert.Equal(10, set.PlainCodes.Count);
        Assert.Equal(10, CountJsonEntries(set.HashedJson));
        Assert.Equal(set.PlainCodes.Count, set.PlainCodes.Distinct().Count());
    }

    [Fact]
    public void Hash_IsDeterministic_ForSameInput()
    {
        var a = _sut.Hash("ABCD-1234");
        var b = _sut.Hash("ABCD-1234");
        Assert.Equal(a, b);
    }

    [Fact]
    public void Hash_DiffersForDifferentInputs()
    {
        Assert.NotEqual(_sut.Hash("A"), _sut.Hash("B"));
    }

    [Fact]
    public void Verify_AcceptsCorrectPlainCode()
    {
        var hash = _sut.Hash("CODE-1");
        Assert.True(_sut.Verify(hash, "CODE-1"));
    }

    [Fact]
    public void Verify_RejectsWrongPlainCode()
    {
        var hash = _sut.Hash("CODE-1");
        Assert.False(_sut.Verify(hash, "CODE-2"));
    }

    [Fact]
    public void Serialize_RoundTrips_ThroughDeserialize()
    {
        var hashed = new[] { _sut.Hash("A"), _sut.Hash("B"), _sut.Hash("C") };
        var json = _sut.Serialize(hashed);
        var back = _sut.Deserialize(json);

        Assert.Equal(3, back.Count);
        Assert.True(_sut.Verify(back[0], "A"));
        Assert.True(_sut.Verify(back[1], "B"));
        Assert.True(_sut.Verify(back[2], "C"));
    }

    [Fact]
    public void Consume_RemovesCode_AndReturnsTrue_WithOneLessEntry()
    {
        var hashed = new[] { _sut.Hash("A"), _sut.Hash("B"), _sut.Hash("C") };
        var json = _sut.Serialize(hashed);

        var ok = _sut.Consume(json, "B", out var newJson);

        Assert.True(ok);
        Assert.Equal(2, CountJsonEntries(newJson));
        var remaining = _sut.Deserialize(newJson);
        Assert.True(_sut.Verify(remaining[0], "A"));
        Assert.True(_sut.Verify(remaining[1], "C"));
    }

    [Fact]
    public void Consume_UnknownCode_ReturnsFalse_AndLeavesJsonUnchanged()
    {
        var hashed = new[] { _sut.Hash("A"), _sut.Hash("B") };
        var json = _sut.Serialize(hashed);

        var ok = _sut.Consume(json, "ZZZ", out var newJson);

        Assert.False(ok);
        Assert.Equal(json, newJson);
    }

    [Fact]
    public void Consume_SameCodeTwice_SecondCallReturnsFalse()
    {
        var hashed = new[] { _sut.Hash("A"), _sut.Hash("B") };
        var json = _sut.Serialize(hashed);

        _sut.Consume(json, "A", out var after1);
        var ok = _sut.Consume(after1, "A", out var after2);

        Assert.False(ok);
        Assert.Equal(after1, after2);
    }

    private static int CountJsonEntries(string json) =>
        json.Count(c => c == ',') + (string.IsNullOrWhiteSpace(json) ? 0 : 1);
}
